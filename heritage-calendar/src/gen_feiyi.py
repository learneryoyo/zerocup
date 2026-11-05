# -*- coding: utf-8 -*-
"""生成「身边的非遗」数据：农历 -> 公历，输出 data.json"""
import json, datetime as dt
from lunardate import LunarDate

Y0, Y1 = 2024, 2030

def sol(y, m, d):
    return dt.date(y, m, d)

def l2s(ly, lm, ld, leap=False):
    return LunarDate(ly, lm, ld, leap).to_solar_date()

def qingming(y):
    yy = y % 100
    d = int(yy * 0.2422 + 4.81) - int(yy / 4)
    return dt.date(y, 4, d)

def xiazhi(y):
    yy = y % 100
    d = int(yy * 0.2422 + 21.37) - int(yy / 4)
    return dt.date(y, 6, d)

def last_day_of_lunar_month(ly, lm):
    """返回农历某月最后一天（公历），用下月初一减一天"""
    s = l2s(ly, lm, 1)
    # 逐日推进找下一个初一
    d = s
    for _ in range(31):
        d = d + dt.timedelta(days=1)
        ld = LunarDate.fromSolarDate(d.year, d.month, d.day)
        if ld.day == 1:
            return d - dt.timedelta(days=1)
    return s + dt.timedelta(days=29)

# ---------------- 事件定义 ----------------
# rule 类型: ("l", m, d, span) 农历某日起持续 span 天
#            ("r", (m1,d1), (m2,d2)) 农历区间
#            ("qm",) 清明 / ("xz",) 夏至 / ("qixi",) 七月初一前夜~初七
#            ("month", m) 农历整月
#            ("fixed", {year: "MM-DD"}) 固定公历/近似公历

E = []
def add(**kw):
    E.append(kw)

add(id="fuxi-spring", name="太昊伏羲祭典 · 春祭", provs=["甘肃省"], place="天水市 · 伏羲庙",
    cat="祭祀", level="国家级非遗", lunar="正月十六", rule=("l", 1, 16, 1), icon="🏮",
    desc="天水伏羲庙民间祭祀一年三祭，春祭固定在正月十六，是全年最隆重的一场。当地人称为「朝人宗」，香火与鼓乐从凌晨延续到日暮。")

add(id="fuxi-autumn", name="太昊伏羲祭典 · 秋祭", provs=["甘肃省"], place="天水市 · 伏羲庙",
    cat="祭祀", level="国家级非遗", lunar="七月十九", rule=("l", 7, 19, 1), icon="🏮",
    desc="与春祭、夏至公祭并列的三大祭之一。秋祭规模略小，但保留了最完整的民间仪轨。")

add(id="fuxi-summer", name="公祭中华人文始祖伏羲大典", provs=["甘肃省"], place="天水市 · 伏羲庙",
    cat="祭祀", level="国家级非遗", lunar="夏至", rule=("xz",), icon="🏮",
    desc="每年夏至由官方主持的公祭，与春祭、秋祭合称「一年三祭」，海内外华人代表都会到场。")

add(id="yuanxiao", name="元宵灯会与舞龙", provs=[], place="各地灯会 · 舞龙 · 庙会",
    cat="节庆", level="多地非遗", lunar="正月十五", rule=("l", 1, 15, 1), icon="🏮",
    desc="正月十五是全年灯会与舞龙最集中的一天。各地龙灯另有自己的固定日期，比如湖北杨店高龙、浙江乾元龙灯会，都在正月里各有档期。")

add(id="yangdian", name="杨店高龙", provs=["湖北省"], place="孝感市孝南区 · 杨店镇",
    cat="传统舞蹈", level="国家级非遗", lunar="正月十二至十五", rule=("r", (1, 12), (1, 15)), icon="🐉",
    desc="龙身高达数丈，需数十人合力举起，正月十二「开光」后连舞四天，是鄂东北年味最重的一幕。")

add(id="qianyuan", name="乾元龙灯会", provs=["浙江省"], place="湖州市德清县 · 乾元镇",
    cat="节庆", level="省级非遗", lunar="正月十三至十八", rule=("r", (1, 13), (1, 18)), icon="🐉",
    desc="正月十三「上灯」，正月十八「落灯」，六天里全镇街巷走灯，是老县城一年中最热闹的时候。")

add(id="taihao", name="淮阳太昊陵庙会", provs=["河南省"], place="周口市淮阳区 · 太昊陵",
    cat="民俗", level="国家级非遗", lunar="二月初二至三月初三", rule=("r", (2, 2), (3, 3)), icon="🎪",
    desc="会期整整一个月，中原地区会期最长、规模最大的庙会，单日客流曾经过百万。泥泥狗、布老虎是这里的标志性手艺。")

add(id="guatai", name="卦台山伏羲庙会", provs=["甘肃省"], place="天水市麦积区 · 卦台山",
    cat="祭祀", level="省级非遗", lunar="二月十五", rule=("l", 2, 15, 1), icon="🏮",
    desc="与正月十六、五月十三并列为天水当地三大祭祀日，相传伏羲在此画八卦。")

add(id="mazu-born", name="妈祖祭典 · 诞辰", provs=["福建省"], place="莆田市 · 湄洲祖庙",
    cat="祭祀", level="人类非遗代表作", lunar="三月廿三", rule=("l", 3, 23, 1), icon="⛩️",
    desc="妈祖祭典一年两祭，诞辰在三月廿三，行仿宋制祭礼，仪仗、乐舞、三献礼一板一眼。湄洲祖庙是全世界妈祖庙的祖庭。")

add(id="dujiangyan", name="都江堰放水节", provs=["四川省"], place="成都市 · 都江堰",
    cat="民俗", level="国家级非遗", lunar="清明", rule=("qm",), icon="💧",
    desc="固定在清明当天，纪念李冰父子、庆祝岁修竣工。古法「杩槎截流—砍杩槎放水」的仪式至今完整保留。")

add(id="qintong", name="溱潼会船", provs=["江苏省"], place="泰州市姜堰区 · 溱潼镇",
    cat="民俗", level="国家级非遗", lunar="清明", rule=("qm",), icon="🚣",
    desc="被称为「水上清明节」，八百多年历史。清明当天十里溱湖千舟竞发，篙船、划船、贡船各成阵仗。")

add(id="zigui-1", name="屈原故里端午 · 头端午", provs=["湖北省"], place="宜昌市 · 秭归县",
    cat="节庆", level="国家级非遗", lunar="五月初五", rule=("l", 5, 5, 1), icon="🚣",
    desc="秭归端午「三次过」的第一场，五月初五祭屈原，游江招魂。")

add(id="zigui-2", name="屈原故里端午 · 大端午", provs=["湖北省"], place="宜昌市 · 秭归县",
    cat="节庆", level="国家级非遗", lunar="五月十五", rule=("l", 5, 15, 1), icon="🚣",
    desc="五月十五是三次端午里最热闹的一场，龙舟竞渡就在这天，江面鼓声能传几里。")

add(id="zigui-3", name="屈原故里端午 · 末端午", provs=["湖北省"], place="宜昌市 · 秭归县",
    cat="节庆", level="国家级非遗", lunar="五月廿五", rule=("l", 5, 25, 1), icon="🚣",
    desc="五月廿五收尾，庆夏收、送瘟神，一个端午前后绵延近月。")

add(id="nadamu", name="蒙古族那达慕", provs=["内蒙古自治区"], place="锡林郭勒盟 等地",
    cat="节庆", level="国家级非遗", lunar="六月初四起 5 天", rule=("l", 6, 4, 5), icon="🐎",
    desc="核心是「男儿三艺」——搏克、赛马、射箭。草原上各旗县另有自己的那达慕档期，六月初四是最传统的一档。")

add(id="huoba-yunnan", name="彝族火把节", provs=["云南省"], place="楚雄彝族自治州",
    cat="节庆", level="国家级非遗", lunar="六月廿四起 3 天", rule=("l", 6, 24, 3), icon="🔥",
    desc="祭火、耍火把、跳左脚舞。楚雄的火把节是云南规模最大的一处，夜里满山火光。")

add(id="huoba-liangshan", name="凉山彝族火把节", provs=["四川省"], place="凉山彝族自治州 · 西昌",
    cat="节庆", level="国家级非遗", lunar="六月廿四起 3 天", rule=("l", 6, 24, 3), icon="🔥",
    desc="凉山把火把节过得最盛大，斗牛、赛马、选美、篝火达体舞，连续三天不歇。")

add(id="huoba-bai", name="白族火把节", provs=["云南省"], place="大理白族自治州",
    cat="节庆", level="省级非遗", lunar="六月廿五", rule=("l", 6, 25, 1), icon="🔥",
    desc="白族火把节比彝族晚一天，村寨中央竖大火把，撒松香、跨火堆，是洱海边的夏夜记忆。")

add(id="xihe", name="西和乞巧节", provs=["甘肃省"], place="陇南市 · 西和县",
    cat="民俗", level="国家级非遗", lunar="六月三十夜至七月初七", rule=("qixi",), icon="🧵",
    desc="历时七天八夜，分坐巧、迎巧、祭巧、拜巧、娱巧、卜巧、送巧七个环节，被称为中国古代乞巧风俗的「活化石」，姑娘们唱巧歌、迎巧娘。")

add(id="zhongyuan", name="中元节 · 洪洞大槐树祭祖大典", provs=["山西省"], place="临汾市洪洞县 · 大槐树",
    cat="祭祀", level="省级非遗", lunar="七月十五", rule=("l", 7, 15, 1), icon="🕯️",
    desc="「问我祖先在何处，山西洪洞大槐树」。每年中元节，海内外移民后裔到此祭祖。")

add(id="yulan", name="香港潮人盂兰胜会", provs=["香港特别行政区"], place="香港 各区街坊",
    cat="民俗", level="国家级非遗", lunar="七月十四起 3 天", rule=("l", 7, 14, 3), icon="🕯️",
    desc="潮汕移民带到香港的七月节俗，搭神棚、演神功戏、派米济贫，2011 年列入国家级非遗名录。")

add(id="xingzi", name="连州星子香火龙", provs=["广东省"], place="清远市连州市 · 星子镇",
    cat="传统舞蹈", level="省级非遗", lunar="八月十五至十七", rule=("r", (8, 15), (8, 17)), icon="🐉",
    desc="用稻草扎龙、遍插线香，夜里舞动时火星飞舞如流萤，中秋三夜连舞。")

add(id="taihang", name="香港大坑舞火龙", provs=["香港特别行政区"], place="香港 · 大坑",
    cat="传统舞蹈", level="国家级非遗", lunar="八月十四至十六", rule=("r", (8, 14), (8, 16)), icon="🐉",
    desc="八月十四开光，八月十六「游大运」。龙身插满万支线香，三百多人轮换舞动，在中秋夜穿过窄街。")

add(id="mazu-up", name="妈祖祭典 · 升天", provs=["福建省"], place="莆田市 · 湄洲祖庙",
    cat="祭祀", level="人类非遗代表作", lunar="九月初九", rule=("l", 9, 9, 1), icon="⛩️",
    desc="妈祖祭典的第二祭。九月初九既是重阳，也是妈祖升天日，祖庙行仿宋制祭礼。")

add(id="qiansou", name="独树岗千叟宴", provs=["广东省"], place="佛山市三水区 · 独树岗村",
    cat="民俗", level="省级非遗", lunar="九月初九", rule=("l", 9, 9, 1), icon="🍵",
    desc="重阳节全村为长者设宴，数百位老人同席，是珠三角保存最好的敬老乡俗之一。")

add(id="huijie", name="阿昌族会街节", provs=["云南省"], place="德宏州 · 陇川县",
    cat="节庆", level="省级非遗", lunar="九月初十起 5 天", rule=("l", 9, 10, 5), icon="🐘",
    desc="耍青龙、玩白象，阿昌语叫「敖露」，是秋收后最隆重的几天。")

add(id="panwang", name="瑶族盘王节", provs=["广西壮族自治区", "湖南省", "广东省"],
    place="贺州 / 江华 / 乳源 等瑶族自治县",
    cat="祭祀", level="国家级非遗", lunar="农历十月（各地择日）", rule=("month", 10), icon="🥁",
    desc="祭祀始祖盘王，是瑶族最盛大的节日。具体日子由各支系择定，但基本落在农历十月内，跳长鼓舞、唱盘王歌。")

add(id="xuedun", name="雪顿节", provs=["西藏自治区"], place="拉萨市 · 哲蚌寺、罗布林卡",
    cat="节庆", level="国家级非遗", lunar="藏历六月三十", rule=("l", 7, 1, 1), icon="🎭",
    desc="藏语意为「酸奶宴」，以哲蚌寺展佛开场，随后几天在罗布林卡看藏戏。藏历与农历基本重合，公历日期每年浮动。",
    floating=True, floatNote="按藏历六月三十推算，与农历七月初一基本重合")

FITR = {2024: "04-10", 2025: "03-31", 2026: "03-20", 2027: "03-10", 2028: "02-27", 2029: "02-15", 2030: "02-05"}
ADHA = {2024: "06-17", 2025: "06-07", 2026: "05-27", 2027: "05-17", 2028: "05-05", 2029: "04-24", 2030: "04-14"}
add(id="fitr", name="开斋节", provs=["宁夏回族自治区", "新疆维吾尔自治区", "甘肃省", "青海省"],
    place="银川 / 乌鲁木齐 / 临夏 等地", cat="节庆", level="民俗节庆",
    lunar="伊斯兰历 10 月 1 日", rule=("fixed", FITR), icon="🌙",
    desc="按伊斯兰教历固定，在公历上逐年提前约 11 天。会礼、走坟、互道「色俩目」。",
    floating=True, floatNote="按伊斯兰历推算，实际以当地观月为准")
add(id="adha", name="古尔邦节", provs=["宁夏回族自治区", "新疆维吾尔自治区", "甘肃省", "青海省"],
    place="银川 / 乌鲁木齐 / 临夏 等地", cat="节庆", level="民俗节庆",
    lunar="伊斯兰历 12 月 10 日", rule=("fixed", ADHA), icon="🌙",
    desc="又称宰牲节。会礼之后宰牲、分肉、走亲，是回族、维吾尔族等民族最隆重的节日之一。",
    floating=True, floatNote="按伊斯兰历推算，实际以当地观月为准")

# ---------------- 展开为公历日期 ----------------
out = []
for ev in E:
    rule = ev["rule"]
    dates = []
    for y in range(Y0, Y1 + 1):
        if rule[0] == "l":
            s = l2s(y, rule[1], rule[2])
            e = s + dt.timedelta(days=rule[3] - 1)
        elif rule[0] == "r":
            s = l2s(y, rule[1][0], rule[1][1])
            e = l2s(y, rule[2][0], rule[2][1])
        elif rule[0] == "qm":
            s = e = qingming(y)
        elif rule[0] == "xz":
            s = e = xiazhi(y)
        elif rule[0] == "qixi":
            s = l2s(y, 7, 1) - dt.timedelta(days=1)
            e = l2s(y, 7, 7)
        elif rule[0] == "month":
            s = l2s(y, rule[1], 1)
            e = last_day_of_lunar_month(y, rule[1])
        elif rule[0] == "fixed":
            md = rule[1].get(y)
            if not md:
                continue
            mm, dd = md.split("-")
            s = e = dt.date(y, int(mm), int(dd))
        dates.append({"s": s.isoformat(), "e": e.isoformat()})
    item = {k: v for k, v in ev.items() if k != "rule"}
    item["dates"] = dates
    out.append(item)

# ---------------- 农历月首表（用于显示所选日期的农历） ----------------
months = []
d = dt.date(2023, 12, 1)
end = dt.date(2031, 2, 1)
while d < end:
    ld = LunarDate.fromSolarDate(d.year, d.month, d.day)
    if ld.day == 1:
        months.append({"d": d.isoformat(), "m": ld.month, "l": bool(ld.isLeapMonth)})
    d += dt.timedelta(days=1)

data = {"events": out, "lunarMonths": months, "range": [Y0, Y1]}
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=1)

print("events:", len(out))
print("months:", len(months))
for e in out[:3]:
    print(e["name"], e["dates"][:2])
print("xihe 2026:", [x for x in out if x["id"] == "xihe"][0]["dates"][2])
print("panwang 2026:", [x for x in out if x["id"] == "panwang-gx"][0]["dates"][2])
print("taihao 2026:", [x for x in out if x["id"] == "taihao"][0]["dates"][2])
