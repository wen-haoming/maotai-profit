const axios = require('axios');
const cherrio = require('cheerio');
const xlsx = require('node-xlsx');
const fs = require('fs');

class Maotai{
    constructor(options = {}){
        this.url = options.url;
        this.export = options.export || 'export.xlsx';
    }
    async start(){
        let html = await this.GetData();
        let data = this.parseHTML(html);
        this.produceFile(data);
    }
    async GetData(){
        return axios.get(this.url).then((result)=>{
            // console.log('result:',result.data);
            return Promise.resolve(result.data);
        })
    }
    parseHTML(html){
        let result = {
            title:[],
            data:[]
        }
        const page = cherrio.load(html);
        const table = page('.table_bg001.border_box.limit_sale.scr_table');
        const title = table.find('tbody tr:first-child');
        const titleChildren = title.children();

        const data = table.find('tbody tr:nth-child(12)');
        const dataChildren = data.children();

        for(let i = 0; i < titleChildren.length; i++){
            const titleTd = titleChildren[i];
            result.title.push(page(titleTd).text().trim());
            const dataTd = dataChildren[i];
            result.data.push(page(dataTd).text().trim());
        }
        return result;
    }
    produceFile(data){
        const values = Object.values(data);
        const buffer = xlsx.build([{
            name:'茅台',
            data:values
        }])
        fs.writeFileSync(this.export,buffer,'buffer');
        console.log('导出Excel成功');
    }
}
let maotai = new Maotai({
    url: 'http://quotes.money.163.com/f10/zycwzb_600519,report.html'
})
maotai.start();