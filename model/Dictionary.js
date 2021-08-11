const DB = require('./DB')

class Dictionary extends DB {

    constructor(props){
        super(props)
        this.createTable({fields:{
            id:'INTEGER PRIMARY KEY',
            word:'TEXT',
            definition:'TEXT'
        }})

    }

    searchLike({search={where:String,like:String},limit=10}={}){
        return new Promise((resolve,reject)=>{
            
            try {
                let where = ''
                let like = ''
                for(let s in search){
                    if(s.toUpperCase() == 'WHERE'){
                        where = `${s} ${search[s]}`
                    }
                    if(s.toUpperCase() == 'LIKE'){
                        like = `${s} '${search[s]}'`
                    }
                }

                let sql = `SELECT * FROM ${this.table} ${where} ${like} LIMIT ${limit}`

                this.db.all(sql,(err,res)=>{
                    if(err) return reject(err)
                    resolve(res)
                })
                
            } catch (error) {
                reject(error)
            }
        })
    }



}



module.exports = Dictionary;