# -*- coding: utf-8 -*-
"""把 data.json 注入 template.html，生成成品 index.html。

用法（在本目录下）：
    python gen_feiyi.py   # 重新生成 data.json（需要 lunardate）
    python build.py       # 生成 ../index.html
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

with open(os.path.join(HERE, "data.json"), encoding="utf-8") as f:
    data = json.load(f)

with open(os.path.join(HERE, "template.html"), encoding="utf-8") as f:
    html = f.read()

if "__DATA__" not in html:
    raise SystemExit("template.html 里找不到 __DATA__ 占位符")

payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
html = html.replace("__DATA__", payload)

out = os.path.join(ROOT, "index.html")
with open(out, "w", encoding="utf-8", newline="\n") as f:
    f.write(html)

print("events:", len(data["events"]))
print("written:", out, len(html), "chars")
