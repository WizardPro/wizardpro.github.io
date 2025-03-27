// 农历转换函数
const lunarCalendar = {
    lunar: function(year, month, day) {
        const lunarInfo = [
            0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
            0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
            0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
            0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
            0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557
        ];
        
        const monthCn = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
        const dayCn = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                      '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                      '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
        
        // 计算农历日期
        let total = 0;
        for(let i = 1900; i < year; i++) {
            total += lunarInfo[i - 1900] & 0xffff;
        }
        let offset = Math.floor((Date.UTC(year, month - 1, day) - Date.UTC(1900, 0, 31)) / 86400000);
        let temp = 0;
        for(let i = 0; i < month; i++) {
            temp += new Date(year, i + 1, 0).getDate();
        }
        offset -= temp - day + 1;
        
        let days = offset + 40;
        let monthIdx = 0;
        let dayIdx = days % 30;
        
        return monthCn[monthIdx] + '月' + dayCn[dayIdx];
    }
};

// SQL格式化函数
const sqlFormatter = {
    format: function(sql) {
        if (!sql.trim()) return '';
        
        // 替换多余的空白字符
        sql = sql.replace(/\s+/g, ' ').trim();
        
        // 主要关键字
        const keywords = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT',
                         'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM'];
        
        // 次要关键字
        const subKeywords = ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'ON', 'AND', 'OR',
                           'UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT'];
        
        // 格式化主要关键字
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            sql = sql.replace(regex, `\n${keyword}`);
        });
        
        // 格式化次要关键字
        subKeywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            sql = sql.replace(regex, `\n  ${keyword}`);
        });
        
        // 处理括号
        sql = sql.replace(/\(/g, '\n(')
                .replace(/\)/g, ')\n');
        
        // 清理多余的空行
        sql = sql.split('\n')
                 .map(line => line.trim())
                 .filter(line => line)
                 .join('\n');
        
        return sql.toUpperCase();
    }
};

const app = Vue.createApp({
    data() {
        return {
            time: '',
            date: '',
            lunar: '',
            currentTool: null,
            jsonInput: '',
            jsonOutput: '',
            sqlInput: '',
            sqlOutput: ''
        }
    },
    methods: {
        updateTime() {
            const now = new Date();
            
            // 更新时间
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            this.time = `${hours}:${minutes}:${seconds}`;
            
            // 更新日期
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            const weekday = weekdays[now.getDay()];
            this.date = `${year}年${month}月${day}日 ${weekday}`;
            
            // 更新农历
            this.lunar = '农历 ' + lunarCalendar.lunar(year, parseInt(month), parseInt(day));
        },
        
        openTool(tool) {
            this.currentTool = tool;
            if (tool === 'json') {
                this.jsonInput = '';
                this.jsonOutput = '';
            } else if (tool === 'sql') {
                this.sqlInput = '';
                this.sqlOutput = '';
            }
            document.body.style.overflow = 'hidden';
        },
        
        closeTool() {
            this.currentTool = null;
            document.body.style.overflow = '';
        },
        
        formatJSON() {
            try {
                if (!this.jsonInput.trim()) {
                    this.jsonOutput = '';
                    return;
                }
                
                const parsed = JSON.parse(this.jsonInput);
                this.jsonOutput = JSON.stringify(parsed, null, 2);
                
                // 触发代码高亮
                this.$nextTick(() => {
                    Prism.highlightAll();
                });
            } catch (e) {
                this.jsonOutput = `错误: ${e.message}`;
            }
        },
        
        formatSQL() {
            try {
                this.sqlOutput = sqlFormatter.format(this.sqlInput);
                
                // 触发代码高亮
                this.$nextTick(() => {
                    Prism.highlightAll();
                });
            } catch (e) {
                this.sqlOutput = `错误: ${e.message}`;
            }
        },
        
        copyToClipboard(type) {
            const content = type === 'json' ? this.jsonOutput : this.sqlOutput;
            if (!content) return;
            
            navigator.clipboard.writeText(content)
                .then(() => {
                    alert('已复制到剪贴板');
                })
                .catch(err => {
                    console.error('复制失败:', err);
                    alert('复制失败，请手动复制');
                });
        },
        
        clearJSON() {
            this.jsonInput = '';
            this.jsonOutput = '';
        },
        
        clearSQL() {
            this.sqlInput = '';
            this.sqlOutput = '';
        }
    },
    mounted() {
        // 启动时钟
        this.updateTime();
        setInterval(this.updateTime, 1000);
        
        // 添加ESC键关闭工具面板
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentTool) {
                this.closeTool();
            }
        });
    }
}).mount('#app');