class LunarCache {
    constructor(maxSize = 100) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    getKey(date) {
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }

    get(date) {
        return this.cache.get(this.getKey(date));
    }

    set(date, value) {
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(this.getKey(date), value);
    }
}

class Lunar {
    constructor(date) {
        this.date = date;
    }

    static lunarInfo = [
        0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
        0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
        0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
        0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
        0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
        0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
        0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
        0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
        0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
        0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0
    ];

    static Gan = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
    static Zhi = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
    static Animals = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
    static monthName = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];
    static dayName = ["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
                     "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
                     "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"];

    static solarTerms = [
        "小寒", "大寒", "立春", "雨水", "惊蛰", "春分",
        "清明", "谷雨", "立夏", "小满", "芒种", "夏至",
        "小暑", "大暑", "立秋", "处暑", "白露", "秋分",
        "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"
    ];

    static solarTermInfo = [
        0, 21208, 42467, 63836, 85337, 107014,
        128867, 150921, 173149, 195551, 218072, 240693,
        263343, 285989, 308563, 331033, 353350, 375494,
        397447, 419210, 440795, 462224, 483532, 504758
    ];

    lYearDays(y) {
        let sum = 348;
        for (let i = 0x8000; i > 0x8; i >>= 1) {
            sum += (Lunar.lunarInfo[y - 1900] & i) ? 1 : 0;
        }
        return sum + this.leapDays(y);
    }

    leapMonth(y) {
        return Lunar.lunarInfo[y - 1900] & 0xf;
    }

    leapDays(y) {
        if (this.leapMonth(y)) {
            return (Lunar.lunarInfo[y - 1900] & 0x10000) ? 30 : 29;
        }
        return 0;
    }

    monthDays(y, m) {
        if (m > 12 || m < 1) {
            return -1;
        }
        return (Lunar.lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29;
    }

    getSolarTerm() {
        const date = this.date;
        const month = date.getMonth();
        const day = date.getDate();
        const year = date.getFullYear();

        const baseDate = new Date(1900, 0, 6, 2, 5);
        const termInfo = Lunar.solarTermInfo[month * 2 + (day < 15 ? 0 : 1)];
        const minutes = termInfo / 60;
        const hours = minutes / 60;
        const days = hours / 24;

        const termDate = new Date(1900, 0, 6 + days);
        const diff = Math.abs(date - termDate) / (24 * 60 * 60 * 1000);

        if (diff < 1) {
            return Lunar.solarTerms[month * 2 + (day < 15 ? 0 : 1)];
        }
        return '';
    }

    getYearZodiac(year) {
        return Lunar.Animals[(year - 4) % 12];
    }

    getYearGanZhi(year) {
        const gan = (year - 4) % 10;
        const zhi = (year - 4) % 12;
        return Lunar.Gan[gan] + Lunar.Zhi[zhi];
    }

    toLunar() {
        let date = this.date;
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();

        let offset = 0;
        for (let y = 1900; y < year; y++) {
            offset += this.isLeapYear(y) ? 366 : 365;
        }
        for (let m = 1; m < month; m++) {
            offset += this.solarDays(year, m);
        }
        offset += day - 1;

        let i, temp;
        for (i = 0; offset > 0; i++) {
            temp = this.lYearDays(1900 + i);
            offset -= temp;
        }
        let lunarYear = 1900 + i;

        offset += temp;
        let leap = this.leapMonth(lunarYear);
        let isLeap = false;

        let lunarMonth = 1;
        for (i = 0; i < 13 && offset > 0; i++) {
            if (leap > 0 && i === leap && !isLeap) {
                --i;
                isLeap = true;
                temp = this.leapDays(lunarYear);
            } else {
                temp = this.monthDays(lunarYear, i + 1);
            }
            if (isLeap && i === leap) {
                isLeap = false;
            }
            offset -= temp;
            if (!isLeap) {
                lunarMonth++;
            }
        }

        offset += temp;
        let lunarDay = offset + 1;

        const solarTerm = this.getSolarTerm();
        const zodiac = this.getYearZodiac(lunarYear);
        const ganZhi = this.getYearGanZhi(lunarYear);

        return {
            year: lunarYear,
            month: lunarMonth,
            day: lunarDay,
            isLeap: isLeap,
            zodiac: zodiac,
            ganZhi: ganZhi,
            solarTerm: solarTerm
        };
    }

    isLeapYear(y) {
        return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
    }

    solarDays(y, m) {
        const monthDays = [31, this.isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return monthDays[m - 1];
    }
}

const cache = new LunarCache();

self.addEventListener('message', function(e) {
    const date = new Date(e.data.date);
    let result = cache.get(date);
    
    if (!result) {
        const lunar = new Lunar(date);
        result = lunar.toLunar();
        cache.set(date, result);
    }
    
    self.postMessage(result);
});