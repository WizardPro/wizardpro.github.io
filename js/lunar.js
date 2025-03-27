class Lunar {
    constructor(date) {
        this.date = date;
    }

    static lunarInfo = [
        0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
        0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
        0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
        0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
        0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557
    ];

    static Gan = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
    static Zhi = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
    static Animals = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
    static solarTerm = ["小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"];
    static sTermInfo = [0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758];
    static nStr1 = ['日', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    static nStr2 = ['初', '十', '廿', '卅'];
    static monthName = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];

    lYearDays(y) {
        let i, sum = 348;
        for (i = 0x8000; i > 0x8; i >>= 1) {
            sum += (Lunar.lunarInfo[y - 1900] & i) ? 1 : 0;
        }
        return sum + this.leapDays(y);
    }

    leapDays(y) {
        if (this.leapMonth(y)) {
            return (Lunar.lunarInfo[y - 1900] & 0x10000) ? 30 : 29;
        }
        return 0;
    }

    leapMonth(y) {
        return Lunar.lunarInfo[y - 1900] & 0xf;
    }

    monthDays(y, m) {
        return (Lunar.lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29;
    }

    cyclical(num) {
        return Lunar.Gan[num % 10] + Lunar.Zhi[num % 12];
    }

    toLunar() {
        let leap = 0, temp = 0;
        let baseDate = new Date(1900, 0, 31);
        let offset = Math.floor((this.date - baseDate) / 86400000);
        let dayCyl = offset + 40;
        let monCyl = 14;
        let year = 1900;
        let yearCyl = offset + 6;

        while (year < 2050 && offset > 0) {
            temp = this.lYearDays(year);
            offset -= temp;
            monCyl += 12;
            year++;
        }

        if (offset < 0) {
            offset += temp;
            year--;
            monCyl -= 12;
        }

        let month = 1;
        let day;
        leap = this.leapMonth(year);

        while (month < 13 && offset > 0) {
            if (leap > 0 && month === (leap + 1) && !temp) {
                --month;
                temp = true;
                temp = this.leapDays(year);
            } else {
                temp = this.monthDays(year, month);
            }

            if (temp === true) {
                temp = this.leapDays(year);
            }

            offset -= temp;
            if (temp === true) {
                temp = false;
            }
            if (!temp) {
                monCyl++;
                month++;
            }
        }

        day = offset + 1;

        return {
            year: year,
            month: month,
            day: day,
            isLeap: temp,
            yearCyl: yearCyl,
            monCyl: monCyl,
            dayCyl: dayCyl
        };
    }

    toString() {
        const lunar = this.toLunar();
        let result = '';
        result += lunar.isLeap ? '闰' : '';
        result += Lunar.monthName[lunar.month - 1] + '月';
        result += (lunar.day < 11) ? '初' : ((lunar.day < 20) ? '十' : ((lunar.day < 30) ? '廿' : '三十'));
        if (lunar.day % 10 || lunar.day === 10) {
            result += Lunar.nStr1[lunar.day % 10];
        }
        return result;
    }
}