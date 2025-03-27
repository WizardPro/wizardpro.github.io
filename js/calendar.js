// 农历转换工具
const calendar = {
    lunarInfo: [0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
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
    ],

    nStr1: ['日', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'],
    nStr2: ['初', '十', '廿', '卅'],
    nStr3: ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'],

    lYearDays: function(y) {
        let i, sum = 348;
        for(i=0x8000; i>0x8; i>>=1) sum += (this.lunarInfo[y-1900] & i)? 1: 0;
        return(sum+this.leapDays(y));
    },

    leapDays: function(y) {
        if(this.leapMonth(y))  return((this.lunarInfo[y-1900] & 0x10000)? 30: 29);
        return(0);
    },

    leapMonth: function(y) {
        return(this.lunarInfo[y-1900] & 0xf);
    },

    monthDays: function(y,m) {
        return((this.lunarInfo[y-1900] & (0x10000>>m))? 30: 29);
    },

    getLunarDate: function(date) {
        let leap = 0, temp = 0;
        let baseDate = new Date(1900,0,31);
        let offset = (date - baseDate)/86400000;
        let dayCyl = offset + 40;
        let monCyl = 14;
        let year = 1900;
        
        while(offset > 0) {
            temp = this.lYearDays(year);
            offset -= temp;
            monCyl += 12;
            year++;
        }
        
        if(offset < 0) {
            offset += temp;
            year--;
            monCyl -= 12;
        }
        
        let month = 1;
        let day;
        leap = this.leapMonth(year);
        let isLeap = false;
        
        while(offset > 0) {
            if(leap > 0 && month == (leap+1) && !isLeap) {
                --offset;
                isLeap = true;
                temp = this.leapDays(year);
            } else {
                temp = this.monthDays(year, month);
            }
            
            if(isLeap && month == (leap+1)) isLeap = false;
            if(!isLeap) month++;
            
            offset -= temp;
        }
        
        if(offset == 0 && leap > 0 && month == leap+1)
            if(isLeap) {
                isLeap = false;
            } else {
                isLeap = true;
                --month;
            }
        
        if(offset < 0) {
            offset += temp;
            --month;
        }
        
        day = offset + 1;
        
        let lunarDay = '';
        if(day == 1) {
            lunarDay = this.nStr3[month-1] + '月';
        } else if(day == 10) {
            lunarDay = '初十';
        } else if(day == 20) {
            lunarDay = '二十';
        } else if(day == 30) {
            lunarDay = '三十';
        } else {
            lunarDay = this.nStr2[Math.floor(day/10)] + this.nStr1[day%10];
        }
        
        return lunarDay;
    }
};