const path = require('path')
const electron = require('electron');


const { BrowserWindow,app,Tray,nativeImage,Menu,ipcMain } = electron;

const isDev = false;


class ElectronApp {

    constructor(){
        this.mainWindow = null;
        this.isShowMainWindow = true;
        this.tray = null;
        this.width = 500
        this.height = 300

        
        this.onInit()
        this.eventListener()
    }
    
    onInit(){
        // tray menu
        this.trayMenu = Menu.buildFromTemplate([
            {
                label:'Show Window',
                click:()=> {
                    this.mainWindow.show();
                    // send web content
                    this.mainWindow.webContents.send('main-window-show')

                }
            },
            {
                label:'Quit App',
                click:()=> app.exit()
            }
        ])
        // main window menu
        this.mainWindowMenu = Menu.buildFromTemplate([
            {
                label:'File',
                submenu:[
                    {
                        label:'Connect Dictory DB',
                        click:()=> {
                            // send main window
                            this.mainWindow.webContents.send('open-db-dialog')
                        }
                    },
                    {
                        label:'Exit App',
                        accelerator:'Ctrl+Q',
                        click:()=> app.exit()
                    }
                ]
            },
            {
                label:'View',
                submenu:[
                    
                    isDev? 
                    {
                        role:'reload'
                    }:
                    {
                        role:'undo'
                    }
                ]
                    
                
            },
            {
                label:'Help'
            }
        ])
    }

    ready(){
        this.mainWindow = new BrowserWindow({
            width: this.width,
            height: this.height,
            icon:path.resolve(__dirname,'assets','icon.png'),
            webPreferences:{
                nodeIntegration:true,
                enableRemoteModule:true,
                contextIsolation:false
            }
        })
        // is dev
        if(isDev){
            this.mainWindow.webContents.openDevTools()
        }
        // set menu
        this.mainWindow.setMenu(this.mainWindowMenu)
        // load window
        this.mainWindow.loadFile(path.resolve(__dirname,'main','index.html'))


        // tray
        let image = nativeImage.createFromPath(path.resolve(__dirname,'assets','icon.png'))
        this.tray = new Tray(image)
        // tooltip
        this.tray.setToolTip('Dictionary')
        this.tray.setContextMenu(this.trayMenu)
        // hide window
        this.mainWindow.on('close',e =>{
            e.preventDefault()
            this.mainWindow.hide()
            this.isShowMainWindow = false;
            // send web content
            this.mainWindow.webContents.send('main-window-hide')
        })
    }

    eventListener(){
        ipcMain.on('main-window-show',()=> {
            if(this.isShowMainWindow == false){
                this.mainWindow.show()
                this.isShowMainWindow = true;
            }
        })

        // show notifa
        ipcMain.on('show-notification',({title,body})=> {
            new electron.Notification({
                title,
                body,
                icon:path.resolve(__dirname,'assets','icon.png')
            }).show()
        })
    }



}


const electronApp = new ElectronApp()

// ready
app.on('ready',()=> electronApp.ready())