const AV = require('leancloud-storage');
const APP_ID = 'jJfXeV1I2kHde68Hnn7A7yEJ-gzGzoHsz';
const APP_KEY = 'SXR99ldnbUDDFITs3h62K9OH';
AV.init({
  appId: APP_ID,
  appKey: APP_KEY,
  serverURLs: 'https://avoscloud.com'
});
const Score = AV.Object.extend('Score');
export const getList = () =>{
    const query = new AV.Query('Score');
    query.descending('score');
    query.limit(8);
    return new Promise((resolve)=>{
        query.find().then((todos) =>{
            resolve(todos.map((it)=>it.attributes));
        },()=>{
            resolve([]);
        });
    });

}
export const addScore = (scope,userId='default',avater='https://app.furongfeng.cn/favicon.ico') => {
    let score = new Score();
    console.log('addscore',scope);
    score.set('score', scope);
    score.set('userId', userId);
    score.set('avater',avater);
    score.save();
}