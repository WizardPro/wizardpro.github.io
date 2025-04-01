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

    getLunarDay(day) {
        const nStr1 = ['日', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
        const nStr2 = ['初', '十', '廿', '三'];
        let str;
        switch (day) {
            case 10:
                str = '初十';
                break;
            case 20:
                str = '二十';
                break;
            case 30:
                str = '三十';
                break;
            default:
                str = nStr2[Math.floor(day / 10)];
                str += nStr1[day % 10];
        }
        return str;
    }

    toLunar() {
        let leap = 0, temp = 0;
        let baseDate = new Date(1900, 0, 31);
        let offset = Math.floor((this.date - baseDate) / 86400000);
        
        // 计算年份
        let year = 1900;
        let yearDays = 0;
        
        while (offset > 0) {
            yearDays = this.lYearDays(year);
            offset -= yearDays;
            year++;
        }
        year--;
        
        // 计算月份
        offset += yearDays;
        let month = 1;
        let monthDays = 0;
        let leapMonth = this.leapMonth(year);
        let isLeap = false;
        
        while (offset > 0) {
            if (month === (leapMonth + 1) && !isLeap && leapMonth > 0) {
                monthDays = this.leapDays(year);
                isLeap = true;
            } else {
                monthDays = this.monthDays(year, month);
                if (isLeap && month === (leapMonth + 1)) {
                    isLeap = false;
                }
                if (!isLeap) {
                    month++;
                }
            }
            offset -= monthDays;
        }
        
        // 计算日期
        if (offset === 0) {
            if (leapMonth > 0 && month === leapMonth + 1) {
                isLeap = true;
            }
            if (!isLeap && month > leapMonth) {
                month--;
            }
        }
        
        offset += monthDays;
        let day = offset;

        return {
            year: year,
            month: month,
            day: day,
            isLeap: isLeap
        };
    }

    toString() {
        const lunar = this.toLunar();
        let result = '';
        
        if (lunar.isLeap) {
            result += '闰';
        }
        
        result += Lunar.monthName[lunar.month - 1] + '月';
        result += this.getLunarDay(lunar.day);
        
        return result;
    }
}