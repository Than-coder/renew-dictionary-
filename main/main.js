const electron = require('electron')
const path = require('path')
const fs = require('fs')
const { ipcRenderer,clipboard }  = electron;
const { dialog,Notification } = electron.remote;

// model
const Dictionary = require('../model/Dictionary')

let db_path = null;
let isWindowShow = true;
let recentClipboard = '';

function showSearchResult(result){
    let li = ''
    for(let res of result){
        li += `<li>${res.word} 
        <br><br>${res.definition}</li>`
    }

    document.querySelector('.result-list ul').innerHTML = li;
}

function searchWord(text){
    // search word
    const dict = new Dictionary({table:'dictionary',DB_PATH:db_path})
    dict.searchLike({
        search:{
        where:'word',
        like:`%${text}%`
        }
    
    })
    .then(res => showSearchResult(res))
    .catch(err => console.log(err))
}

function searchInputChange(e){
    let text = e.target.value;
    if(text == ''){
        document.querySelector('.result-list ul').innerHTML = ''
        return false;

    }
    searchWord(text)    
}

// auto listen clipboard
function listenClipboard(){
    let word = clipboard.readText()
    if(word == '') return false;

    let reg = /^[a-zA-Z]+$/g 
    if(reg.test(word)){
        let search = document.querySelector('.search input');
        // is word
        if(word != recentClipboard){
            search.value = word;
            // set recent clipboard
            recentClipboard = word;
            // search value
            searchWord(word)
            // window show or focus
            ipcRenderer.send('main-window-show')
            isWindowShow = true;
        }
    }
    // is window hide & start loop
    if(isWindowShow == false){
        setTimeout(listenClipboard,1500);
    }
}


///////////////text speech///////////////
function textSpeech(){
    console.log('click');
    
}


////////////////notification///////////////////
function showNotification({title,body}){
    new Notification({
        icon:path.resolve(__dirname,'../','assets','icon.png'),
        title,
        body
    }).show()
}

////////////////dialog///////////////////
function openDBDialog(){
    let res = dialog.showOpenDialogSync(
        {
            properties:['openFile']
            ,filters:[
                {
                    name:'sqlite',
                    extensions:['sqlite']
                },
                {
                    name:'All File',
                    extensions:['*']
                }
            ]
        }
    )
    if(res){
        // is choose
        db_path = res[0];
        // set local store
        localStorage.setItem('db_path',db_path)
        // show notification
        showNotification({
            title:'DB File Dialog',
            body:'DB File Path Added'
        })
    }
}


///////////////app ready//////////////////
function appReady(){
    // listen clipboard
    let word = clipboard.readText()
    if(word != ''){

        let reg = /^[a-zA-Z]+$/g 
        if(reg.test(word)){
            // set recent clipboard
            recentClipboard = word;
        }
    }


    // check db path
    let res = localStorage.getItem('db_path')
    if(res){
        // check db exists
        if(fs.existsSync(res)){
            // is found
            db_path = res;
        }else{
            // not found db_path and clear
            localStorage.setItem('db_path',undefined)
        }
    }

    // not found db path
    if(db_path == null){
        showNotification({
            title:'DB Path',
            body:'DB Path Not Found!!!'
        })
    }
    

}



////////////////electron event//////////////////
ipcRenderer.on('main-window-hide',() => {
    isWindowShow = false;
    listenClipboard()
})

ipcRenderer.on('main-window-show',() => {
    isWindowShow = true;
})

// dialog
ipcRenderer.on('open-db-dialog',openDBDialog)


////////////////event//////////////////
document.querySelector('.search input').addEventListener('input',searchInputChange)
document.querySelector('.speak-btn').addEventListener('click',textSpeech)



window.onload = ()=> {
    appReady()
}