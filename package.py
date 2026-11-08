#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
2026 零杯网页设计大赛（零组）· 提交打包脚本

产出符合手册要求的两个压缩包：

    dist/零杯零组-<队伍名>-<队长姓名>.zip
        ├── 2026-零杯零组-<队伍名>-<队长姓名>-完整版本.zip
        └── 2026-零杯零组-<队伍名>-<队长姓名>-匿名版本.zip

用法：
    python package.py --team 海底小纵队 --captain 屈乐瑶
    python package.py --team 海底小纵队 --captain 屈乐瑶 --names 屈乐瑶,张三,李四

做了四件事：
    1. 排除 .git / 开发脚本 / 模板页 / 无入链的试验页
    2. 剥掉所有图片的 EXIF（相机型号、GPS、作者字段）
    3. 匿名版把 README 的成员表整段删掉
    4. 打包后回扫一遍，命中成员姓名就报错中止
"""

import argparse
import os
import re
import shutil
import sys
import tempfile
import zipfile
from pathlib import Path

REPO = Path(__file__).resolve().parent

# 顶层不进入提交包的东西
SKIP_TOP = {
    ".git",
    ".gitignore",
    ".gitattributes",
    ".claude",
    "dist",
    "prototypes",
    "package.py",
    "git-manual.md",
    "__pycache__",
}

# 包内不进入提交包的单个文件（相对仓库根，正斜杠）
SKIP_FILES = {
    "site/home-mosaic.html",      # 六色块备选首页，无入链
    "site/template.html",         # 新页面模板
    "site/heritage/template.html",# 非遗子页模板
    # 设计参考图：是他人网站的设计截图，不是作品内容。
    # 赛制按「与现有项目重复度」判定抄袭，这类图进包只会给自己添材料。
    "docs/heritage-ref-class.jpg",
    # 内部施工方案：写着本机绝对路径 C:/Users/<用户名>/…，属于匿名版明令要清的身份线索，
    # 对评委也没有参考价值，整份不进包。
    "docs/work-split-3ai.md",
}

# 不进入提交包的目录（相对仓库根，正斜杠，含子目录）
SKIP_DIRS = {
    "docs/timeline-guide",        # 时间轴长卷的生成工具与中间产物，22 MB，与作品无关
}

# 匿名单里允许出现的第三方联系方式（赛事官方收件邮箱）
WHITELIST_CONTACTS = {"2402065071@qq.com"}

MEMBERS_RE = re.compile(r"<!--\s*BEGIN-MEMBERS\s*-->.*?<!--\s*END-MEMBERS\s*-->", re.S)
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"(?<!\d)1[3-9]\d{9}(?!\d)")
# 本机绝对路径会带出系统用户名，匿名版明令要清
PATH_RE = re.compile(r"(?:[A-Za-z]:[\\/]+Users[\\/]+[^\\/\s\"'<>|]+|/Users/[^/\s\"'<>|]+)")

IMG_EXT = {".jpg", ".jpeg", ".png", ".webp"}

# 只有这些扩展名当文本扫，其余一律跳过（避免把二进制内容误判成邮箱/手机号）
TEXT_EXT = {".html", ".htm", ".css", ".js", ".json", ".md", ".txt", ".svg", ".xml", ".csv"}


# ---------------------------------------------------------------- 文件收集


def collect_files():
    """返回要打进包里的文件列表（相对仓库根的 Path）。"""
    picked = []
    for p in REPO.rglob("*"):
        if not p.is_file():
            continue
        rel = p.relative_to(REPO)
        parts = rel.parts
        if parts[0] in SKIP_TOP:
            continue
        # 下划线开头的是本地探针 / 截图脚本（与 .gitignore 的 _* 规则一致），不进提交包
        if any(part.startswith("_") for part in parts):
            continue
        if rel.as_posix() in SKIP_FILES:
            continue
        if any(rel.as_posix() == d or rel.as_posix().startswith(d + "/") for d in SKIP_DIRS):
            continue
        picked.append(rel)
    return sorted(picked)


# ---------------------------------------------------------------- EXIF 剥离


def strip_jpeg_exif(path: Path) -> bool:
    """字节级删除 JPEG 的 APP1(Exif) 段，不重新编码，画质无损。"""
    data = path.read_bytes()
    if len(data) < 4 or data[:2] != b"\xff\xd8":
        return False

    out = bytearray(data[:2])
    i, changed = 2, False
    while i + 1 < len(data):
        if data[i] != 0xFF:
            break
        marker = data[i + 1]

        if marker in (0xD8, 0xD9) or 0xD0 <= marker <= 0xD7:
            out += data[i:i + 2]
            i += 2
            continue
        if i + 4 > len(data):
            break

        seg_len = int.from_bytes(data[i + 2:i + 4], "big")
        end = i + 2 + seg_len
        seg = data[i:end]

        if marker == 0xE1 and seg[4:10] == b"Exif\x00\x00":
            changed = True                      # 丢掉这一段
        else:
            out += seg

        i = end
        if marker == 0xDA:                      # SOS 之后是压缩数据，原样接上
            out += data[i:]
            break

    if changed:
        path.write_bytes(bytes(out))
    return changed


def strip_exif(path: Path) -> bool:
    if path.suffix.lower() in (".jpg", ".jpeg"):
        return strip_jpeg_exif(path)
    # PNG / WebP 走 PIL，这类文件里 EXIF 很少见
    try:
        from PIL import Image
    except ImportError:
        return False
    try:
        im = Image.open(path)
        exif = im.getexif()
        if not exif:
            return False
        data = list(im.getdata())
        clean = Image.new(im.mode, im.size)
        clean.putdata(data)
        clean.save(path)
        return True
    except Exception:
        return False


# ---------------------------------------------------------------- 打包


def build(out_dir: Path, files, anon: bool, members: list) -> Path:
    stage = Path(tempfile.mkdtemp(prefix="zerocup-"))
    exif_hits = 0

    try:
        for rel in files:
            src = REPO / rel
            dst = stage / rel
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)

            if dst.suffix.lower() in IMG_EXT and strip_exif(dst):
                exif_hits += 1

        if anon:
            readme = stage / "README.md"
            if readme.exists():
                text = readme.read_text(encoding="utf-8")
                text, n = MEMBERS_RE.subn(
                    "> 本作品以匿名形式参赛，不包含任何选手个人信息。", text
                )
                readme.write_text(text, encoding="utf-8")
                print("  成员表已移除：%d 段" % n)

        suffix = "匿名版本" if anon else "完整版本"
        # 手册规定的命名：2026-零杯零组-队伍名-队长姓名-完整版本.zip
        zip_path = out_dir / ("2026-零杯零组-%s-%s-%s.zip" % (TEAM, CAPTAIN, suffix))
        if zip_path.exists():
            zip_path.unlink()

        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
            for p in sorted(stage.rglob("*")):
                if p.is_file():
                    zf.write(p, p.relative_to(stage).as_posix())

        print("  %s  %d 个文件  %.1f MB  剥 EXIF %d 张"
              % (zip_path.name, len(files), zip_path.stat().st_size / 1048576, exif_hits))
        return zip_path
    finally:
        shutil.rmtree(stage, ignore_errors=True)


# ---------------------------------------------------------------- 回扫检查


def audit(zip_path: Path, members: list) -> bool:
    """在压缩包内回扫个人信息，命中姓名直接判定失败。"""
    name_hits, mail_hits, phone_hits, path_hits = [], set(), set(), set()

    with zipfile.ZipFile(zip_path) as zf:
        for info in zf.infolist():
            # 文件名本身也可能泄露身份（张三的海报.png）
            for m in members:
                if m and m in info.filename:
                    name_hits.append((info.filename, "文件名含姓名"))

            if Path(info.filename).suffix.lower() not in TEXT_EXT:
                continue
            try:
                text = zf.read(info).decode("utf-8", errors="ignore")
            except Exception:
                continue

            for m in members:
                if m and m in text:
                    name_hits.append((info.filename, m))
            for e in EMAIL_RE.findall(text):
                if e not in WHITELIST_CONTACTS:
                    mail_hits.add((info.filename, e))
            for ph in PHONE_RE.findall(text):
                phone_hits.add((info.filename, ph))
            for pa in PATH_RE.findall(text):
                path_hits.add((info.filename, pa))

    ok = True
    if name_hits:
        ok = False
        print("  [失败] 匿名包里出现成员姓名：")
        for f, m in name_hits[:10]:
            print("         %s → %s" % (f, m))
    if mail_hits:
        print("  [注意] 疑似邮箱（确认是否为选手个人信息）：")
        for f, e in sorted(mail_hits)[:10]:
            print("         %s → %s" % (f, e))
    if phone_hits:
        print("  [注意] 疑似手机号：")
        for f, ph in sorted(phone_hits)[:10]:
            print("         %s → %s" % (f, ph))
    if path_hits:
        print("  [注意] 本机绝对路径（会带出系统用户名）：")
        for f, pa in sorted(path_hits)[:10]:
            print("         %s → %s" % (f, pa))
    if ok and not mail_hits and not phone_hits and not path_hits:
        print("  [通过] 未发现姓名、邮箱、手机号、本机路径")
    return ok


# ---------------------------------------------------------------- 入口


def main():
    global TEAM, CAPTAIN

    ap = argparse.ArgumentParser(description="零杯零组提交打包")
    ap.add_argument("--team", required=True, help="队伍名，例如 海底小纵队")
    ap.add_argument("--captain", required=True, help="队长姓名")
    ap.add_argument("--names", default="", help="成员姓名，逗号分隔，用于匿名版回扫")
    ap.add_argument("--out", default="dist", help="输出目录，默认 dist/")
    args = ap.parse_args()

    TEAM, CAPTAIN = args.team.strip(), args.captain.strip()
    members = [n.strip() for n in args.names.split(",") if n.strip()]
    if CAPTAIN not in members:
        members.append(CAPTAIN)

    out_dir = REPO / args.out
    out_dir.mkdir(exist_ok=True)

    files = collect_files()
    print("仓库文件 %d 个，进入提交包 %d 个" % (len(list(REPO.rglob("*"))), len(files)))
    print()

    print("[1/2] 完整版本")
    full = build(out_dir, files, anon=False, members=members)
    print()

    print("[2/2] 匿名版本")
    anon = build(out_dir, files, anon=True, members=members)
    print()

    print("匿名版回扫：")
    ok = audit(anon, members)
    print()

    outer = out_dir / ("零杯零组-%s-%s.zip" % (TEAM, CAPTAIN))
    if outer.exists():
        outer.unlink()
    with zipfile.ZipFile(outer, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.write(full, full.name)
        zf.write(anon, anon.name)

    print("外层压缩包：%s  %.1f MB" % (outer.name, outer.stat().st_size / 1048576))
    print("邮件主题：零杯零组-%s-%s" % (TEAM, CAPTAIN))
    print("收件邮箱：2402065071@qq.com    截止：11 月 14 日 22:00")
    print()
    if not ok:
        print("！匿名版检查未通过，先处理上面的姓名命中再提交。")
        return 1
    print("全部完成，可以直接发邮件。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
