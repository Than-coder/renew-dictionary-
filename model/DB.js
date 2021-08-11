const path = require('path')
const sqlite = require('sqlite3')


class DB {
    constructor({table=null,DB_PATH=null}={}){
        this.table = table;
        if(DB_PATH == null){
            DB_PATH=path.join(__dirname,'dictionary.sqlite')
        }
        this.db = new sqlite.Database(DB_PATH)
        
    }

    createTable({fields}={}){
        let _fields = []

        for(let f in fields){
            _fields.push(`${f} ${fields[f]}`)
        }

        if(this.table == null) return console.log('tabel is null');

        let sql = `CREATE TABLE IF NOT EXISTS ${this.table} (${_fields.join(',')})`

        this.db.run(sql,error =>{
            if(error) console.log(error);
        })

    }

    find({limit=10,query=[],get_fields=['*'],sort=['id',false]}={}){
        return new Promise((resolve,reject)=>{
            try {
                let _query = '';
                let _sort = '';
                let _fields = get_fields.length > 1 ? get_fields.join(',') : get_fields[0]
                let _limit = `LIMIT ${limit}`;

                // check sort
                if(sort.length == 1){
                    throw 'sort should have 2 parameters [field name,boolean]'
                }

                // set sort
                _sort = sort[1] ? `ORDER BY ${sort[0]} ASC` :`ORDER BY ${sort[0]} DESC` ;
                // query
                if(query.length == 1){
                    throw 'query should have 2 parameters [field name,search name]'
                }
                // set query
                _query = query.length > 1 ? `WHERE ${query[0]}='${query[1]}'`: ''
                
                // sql
                let sql = `SELECT ${_fields} FROM ${this.table} ${_query} ${_sort} ${_limit}`
                // db
                this.db.all(sql,(err,res)=>{
                    if(err) return reject(err)
                    // success
                    resolve(res)
                })
                
                
            } catch (error) {
                reject(error)
            }

        })
    }

    findOne({query=[],get_fields=['*']}={}){
        return new Promise((resolve,reject)=>{
            try {
                let _query = '';
                let _fields = get_fields.length > 1 ? get_fields.join(',') : get_fields[0]

                // query
                if(query.length == 1){
                    throw 'query should have 2 parameters [field name,search name]'
                }
                // set query
                _query = query.length > 1 ? `WHERE ${query[0]}='${query[1]}'`: ''

                // sql
                let sql = `SELECT ${_fields} FROM ${this.table} ${_query}`

                // db
                this.db.get(sql,(err,res)=>{
                    if(err) return reject(err)
                    // success
                    resolve(res)
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    insertOne(objects){
        return new Promise((resolve,reject)=>{
            let fields = [];
            let values = [];
            try {

                for(let k in objects){
                    fields.push(k)
                    values.push(objects[k])
                }
                let _fields = fields.join(',');
                let _values = values.map(v => '?')

                
                let sql = `INSERT INTO ${this.table} (${_fields}) VALUES (${_values});`
                // set
                this.db.run(sql,values,(err,res)=>{
                    if(err) return reject(err)
                    // success
                    resolve('Post Addded')
                    
                })
                
            } catch (error) {
                reject(error)
            }
        })
        
    }

    deleteOne({query=[]}={}){
        return new Promise((resolve,reject)=>{
            try {
                // check query length
                if(!query.length > 1 ) throw 'query should have two parameters [field name,delete value]'; 
                // set query
                let _query = `${query[0]}=?`
                // sql
                let sql = `DELETE FROM ${this.table} WHERE ${_query}`; 
                // db
                this.db.run(sql,query[1],err =>{
                    if(err) return reject(err)
                    //pass
                    resolve('Post Deleted')
                })
                

            } catch (error) {
                reject(error)
            }
        })
    }

    updateOne({query=[],update_fields={}}={}){
        return new Promise((resolve,reject)=>{
            try {
                let updateFields = [];
                // check query length
                if(!query.length > 1 ) throw 'query should have two parameters [field name,update value]'; 
                // set query
                let _query = `${query[0]}=?`

                // field
                for(let f in update_fields){
                    updateFields.push(`${f}='${update_fields[f]}'`)
                }
                // check updateFields
                if(updateFields.length == 0) throw 'update fields Not Found!'
                // set _update
                let _update = updateFields.join(',');
                
                // sql
                let sql = `UPDATE ${this.table} SET ${_update}  WHERE  ${_query}`; 

                // db
                this.db.run(sql,query[1],err =>{
                    if(err) return reject(err)
                    //pass
                    resolve('Post Updated')
                })
                

            } catch (error) {
                reject(error)
            }
        })
    }


}



module.exports = DB