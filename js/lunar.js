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
    static monthName = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];
    static dayName = ["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
                     "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
                     "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"];

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
        let isLeap = false;

        while (month < 13 && offset > 0) {
            if (leap > 0 && month === (leap + 1) && !isLeap) {
                --month;
                isLeap = true;
                temp = this.leapDays(year);
            } else {
                temp = this.monthDays(year, month);
            }

            if (isLeap && month === (leap + 1)) {
                isLeap = false;
            }

            offset -= temp;
            if (!isLeap) {
                monCyl++;
            }
            month++;
        }

        day = offset + 1;

        return {
            year: year,
            month: month,
            day: day,
            isLeap: isLeap,
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
        result += Lunar.dayName[lunar.day - 1];
        return result;
    }
}