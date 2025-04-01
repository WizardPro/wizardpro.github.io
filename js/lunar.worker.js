// 农历数据
const lunarInfo = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
    0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
    0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
    0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
    0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0
];

// 天干
const gan = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
// 地支
const zhi = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
// 生肖
const animals = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
// 月份
const months = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];
// 日期
const days = ["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
    "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
    "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"];

class Lunar {
    constructor(date) {
        this.date = date;
        const now = new Date(date);
        this.year = now.getFullYear();
        this.month = now.getMonth() + 1;
        this.day = now.getDate();
        this.calculate();
    }

    calculate() {
        let offset = 0;
        let temp = 0;
        let i;

        // 计算从1900年1月31日到目标日期的天数
        for (i = 1900; i < this.year; i++) {
            temp = this.getLunarYearDays(i);
            offset += temp;
        }

        // 计算当年农历月份的天数
        let leap = this.getLeapMonth(this.year);
        let isLeap = false;

        for (i = 1; i < this.month; i++) {
            if (leap > 0 && i === leap + 1 && !isLeap) {
                isLeap = true;
                i--;
                temp = this.getLeapDays(this.year);
            } else {
                temp = this.getMonthDays(this.year, i);
            }
            if (isLeap && i === leap + 1) {
                isLeap = false;
            }
            offset += temp;
        }

        offset += this.day - 1;

        let baseDate = new Date(1900, 0, 31);
        let objDate = new Date(this.year, this.month - 1, this.day);
        let offset2 = Math.floor((objDate - baseDate) / 86400000);

        if (offset2 === offset) {
            let year = 1900;
            let month = 1;
            let day = 1;
            offset = offset2;

            while (offset > 0) {
                temp = this.getLunarYearDays(year);
                if (offset < temp) {
                    break;
                }
                offset -= temp;
                year++;
            }

            temp = 0;
            let monthDays;
            let leapMonth = this.getLeapMonth(year);
            let isLeapMonth = false;

            for (month = 1; month <= 12; month++) {
                if (leapMonth > 0 && month === leapMonth + 1 && !isLeapMonth) {
                    isLeapMonth = true;
                    month--;
                    monthDays = this.getLeapDays(year);
                } else {
                    monthDays = this.getMonthDays(year, month);
                }

                if (isLeapMonth && month === leapMonth + 1) {
                    isLeapMonth = false;
                }

                if (offset < monthDays) {
                    break;
                }
                offset -= monthDays;
            }

            day = offset + 1;

            this.lunarYear = year;
            this.lunarMonth = month;
            this.lunarDay = day;
            this.isLeap = isLeapMonth;
        }
    }

    getLunarYearDays(year) {
        let i, sum = 348;
        for (i = 0x8000; i > 0x8; i >>= 1) {
            sum += (lunarInfo[year - 1900] & i) ? 1 : 0;
        }
        return sum + this.getLeapDays(year);
    }

    getLeapDays(year) {
        if (this.getLeapMonth(year)) {
            return (lunarInfo[year - 1900] & 0x10000) ? 30 : 29;
        }
        return 0;
    }

    getLeapMonth(year) {
        return lunarInfo[year - 1900] & 0xf;
    }

    getMonthDays(year, month) {
        return (lunarInfo[year - 1900] & (0x10000 >> month)) ? 30 : 29;
    }

    toString() {
        let result = '';
        if (this.isLeap) {
            result += '闰';
        }
        result += months[this.lunarMonth - 1] + '月';
        result += days[this.lunarDay - 1];
        return result;
    }
}

// 监听消息
self.onmessage = function(e) {
    const date = new Date(e.data.date);
    const lunar = new Lunar(date);
    self.postMessage({
        month: lunar.lunarMonth,
        day: lunar.lunarDay,
        isLeap: lunar.isLeap
    });
};