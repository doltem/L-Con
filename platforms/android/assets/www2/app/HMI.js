//==================================VARIABLES====================================
var host="http://localhost";
var start=0;
var end=0;
//==================================MODELS===================================
//model fore Setting View
var settingModel = kendo.observable({
    host:"http://localhost",

    onChange: function (e){
        areaModel.set("areaSource.options.transport.read.url",this.host+"/service/area");
        areaModel.set("areaSource.options.transport.create.url",this.host+"/service/area");
        areaModel.set("areaSource.options.transport.update.url",this.host+"/service/area");
        areaModel.areaSource.read();
        
        areaModel.set("deviceSource.options.transport.read.url",this.host+"/service/location");
        areaModel.set("deviceSource.options.transport.update.url",this.host+"/service/location");
        areaModel.deviceSource.read();
        
        zoneModel.set("zoneSource.options.transport.read.url",this.host+"/service/zone");
        zoneModel.set("zoneSource.options.transport.update.url",this.host+"/service/zone");
        zoneModel.zoneSource.read();
        
        zoneModel.set("statusSource.options.transport.read.url",this.host+"/service/zone");
        zoneModel.statusSource.read();
        
        zoneModel.set("commandSource.options.transport.create.url",this.host+"/service/zone");
        
        eventModel.set("eventSource.options.transport.read.url",this.host+"/service/event");
        eventModel.eventSource.read();
        
        scheduleModel.set("scheduleSource.options.transport.read.url",this.host+"/service/schedule");
        scheduleModel.scheduleSource.read();
        
        console.log(areaModel.areaSource.options.transport.read.url);
    }
});

//Model for Schedule View
var scheduleModel = kendo.observable({
    area: "Tes",
    address:"",
    alias:"--",
    zone:0,
    dstart:2,
    dend:2,
    tstart:"00:00:00",
    tend:"00:00:00",
    lamp:false,
    mode:false,
    
    
    scheduleSource: new kendo.data.DataSource({
      schema: { model: {id:"id"} },
      autoSync: false,
      transport: {
        read: {
          url: settingModel.host+"/service/schedule",
          dataType: "json",
          type: "GET"
        },
        destroy:{
          url: settingModel.host+"/service/schedule/delete",
          dataType: "json",
          type: "POST"
        }
      },
      
      group: { field: "zone" },
      
      requestStart: function (e){
        console.log("areaSource request START");
        //start=Date.now();
      },

      requestEnd: function (e){
        //end=Date.now();
        //console.log("Delay pengambilan schedule : "+(end-start));
      }


    }),
    
    commandSource: new kendo.data.DataSource({
      schema: { model: {} },
      transport: {
        create: {
          url: settingModel.host+"/service/schedule",
          dataType: "json",
          type: "POST"
        }
      },
      requestStart: function (e){
        console.log("areaSource request START");
        //start=Date.now();
      },

      requestEnd: function (e){
        //end=Date.now();
        //console.log("Delay Pembuatan Schedule : "+(end-start));
      }

    }),
    
    zoneSource : new kendo.data.DataSource({}),

    setFilter: function(data){
        this.scheduleSource.filter({ field: "address", operator: "eq", value: data });
        zoneModel.zoneSource.filter({ field: "address", operator: "eq", value: data }); 
        this.zoneSource.data(zoneModel.zoneSource.data());
        var dataItem = this.zoneSource.at(0);
        console.log(dataItem.zone);
    },
    
    onRemove: function(e){
        var index = e.item.index();
        var data = this.scheduleSource.at(index);
        this.scheduleSource.remove(data);
        this.scheduleSource.sync();
        console.log(data);
        setTimeout(function(){
          zoneModel.onCommand=0;
        }, 2000);
        //this.scheduleSource.read();
    },
    
    onSelectZone: function(e){
      var data = this.zoneSource.view()[e.item.index()];
      console.log(data);
      this.set("zone",data.zone);
      this.set("alias",data.alias);
      this.set("address",data.address);
      //console.log("index "+zoneModel.index);
      $("#modalview-schedule-add").data("kendoMobileModalView").close();
    },
    
    onSelectSchedule: function(e){
      var index = e.item.index();
      var data = this.areaSource.view()[index];
      this.set("area",data.area);
      this.deviceSource.filter({ field: "area", operator: "eq", value: data.area });
      //console.log("masuk di onSelect")
      $("#modalview-areaschedule").data("kendoMobileModalView").close();
    },
    
    onSave: function(){
      console.log("onSave");
      var command={
        zone: this.zone,
        address:this.address,
        dstart : this.dstart,
        dend : this.dend,
        tstart : this.tstart,
        tend : this.tend,
        lamp : (this.lamp==true)?1:0, 
        mode : (this.mode==true)?1:0
      };
      this.commandSource.add(command);
      this.commandSource.sync();
      this.commandSource.remove(this.commandSource.at(0));
      setTimeout(function(){
        zoneModel.onCommand=0;
      }, 2000);
      this.scheduleSource.read();
      
    }

});

//Model for Area Dropdown List
var areaModel = kendo.observable({
    area: "Tes",
    areaSource: new kendo.data.DataSource({
      transport: {
        read: {
          url: settingModel.host+"/service/area",
          dataType: "json",
          type: "GET"
        },
        create: {
          url: settingModel.host+"/service/area",
          dataType: "json",
          type: "POST"
        },
        update:{
          url: settingModel.host+"/service/area",
          dataType: "json",
          type: "PUT"          
        }
      },

      requestStart: function (e){
        console.log("areaSource request START");
        //start=Date.now();
      },

      requestEnd: function (e){
        //end=Date.now();
        //console.log("Delay List Area : "+(end-start));
      }

    }),

    deviceSource: new kendo.data.DataSource({
      transport: {
        read: {
          url: settingModel.host+"/service/location",
          dataType: "json",
          type: "GET"
        },
        update:{
          url: settingModel.host+"/service/location",
          dataType: "json",
          type: "PUT"          
        }
      },

      requestStart: function (e){
        console.log("areaSource request START");
        //start=Date.now();
      },

      requestEnd: function (e){
        //end=Date.now();
       // console.log("Delay List Perangkat : "+(end-start));
      }


    }),
    
    init: function(data){
      this.deviceSource.filter({ field: "area", operator: "eq", value: data });
      this.set("area",data);
    },

    onSelect: function(e){
      var index = e.item.index();
      var data = this.areaSource.view()[index];
      this.set("area",data.area);
      this.deviceSource.filter({ field: "area", operator: "eq", value: data.area });
      //console.log("masuk di onSelect")
      $("#modalview-area").data("kendoMobileModalView").close();
    },
    
    onSelectSchedule: function(e){
      var index = e.item.index();
      var data = this.areaSource.view()[index];
      this.set("area",data.area);
      this.deviceSource.filter({ field: "area", operator: "eq", value: data.area });
      //console.log("masuk di onSelect")
      $("#modalview-areaschedule").data("kendoMobileModalView").close();
    }

});


//Model for Zone Dropdown List
var zoneModel = kendo.observable({
    id:"",
    address:"",
    alias:"",
    zone:"",
    occ: 1,
    lux:800,
    lamp:true,
    mode:false,
    setpoint: 900,
    errorband:50,
    index:0,
    
    onCommand:0,
    viewactive:0,

    zoneSource: new kendo.data.DataSource({
      transport: {
        read: {
          url: settingModel.host+"/service/zone",
          dataType: "JSON",
          type: "GET"
        },
        update:{
          url: settingModel.host+"/service/zone",
          dataType: "JSON",
          type: "PUT"          
        }
      },

      requestStart: function (e){
        console.log("areaSource request START");
        //start=Date.now();
      },

      requestEnd: function (e){
        //end=Date.now();
        //console.log("Delay List Status : "+(end-start));
      },



      filter: { field: "address", operator: "eq", value: "" }

    }),

    statusSource: new kendo.data.DataSource({
      schema: { model: {} },
      transport: {
        read: {
          url: settingModel.host+"/service/zone",
          dataType: "JSON",
          type: "GET"
        }
      },

      requestStart: function (e){
        console.log("statusSource request START");
      },

      requestEnd: function (e){
        setTimeout(function(){
          var data = zoneModel.statusSource.at(zoneModel.index);
          zoneModel.setStatusFilter(data);         
        }, 200);
        
        console.log("statusSource request END");
      },

    }),
    
    commandSource: new kendo.data.DataSource({
      schema: { model: {} },
      transport: {
        create:{
          url: settingModel.host+"/service/zone",
          dataType: "JSON",
          type: "POST"          
        }
      },

      requestStart: function (e){
        console.log("areaSource request START");
        //start=Date.now();
      },

      requestEnd: function (e){
        //end=Date.now();
        //console.log("Delay Pemberian Perintah : "+(end-start));
      }


    }),


    setZoneFilter: function(data){
      this.zoneSource.filter({ field: "address", operator: "eq", value: data });
    },

    setStatusFilter: function(data){
      this.set("zone",data.zone);
      this.set("occ",(data.occ==0)?"UNOCCUPIED":"OCCUPIED");
      this.set("lux",data.lux);
      this.set("lamp",(data.lamp==0)?false:true);
      this.set("mode",(data.mode==0)?false:true);
      this.set("setpoint",data.setpoint);
      this.set("errorband",data.errorband);
      this.set("address",data.address);
      this.set("alias",data.alias);
      this.set("id",data.id);
      //console.log("data [ occ, lux, lamp, mode, setpoint,errorband] : ["+this.occ+", "+this.lux+", "+this.lamp+", "+this.mode+", "+this.setpoint+", "+this.errorband+"]");
    },

    onSelect: function(e){
      var data = this.zoneSource.view()[e.item.index()];
      console.log(data);
      zoneModel.index=zoneModel.zoneSource.indexOf(data);
      //console.log("index "+zoneModel.index);
      this.setStatusFilter(data);
      $("#modalview-zone").data("kendoMobileModalView").close();
    },
    
    onChangeLamp: function(){
        this.set("mode",false);
        this.onChange();
    },
    
    onChange: function(){
      zoneModel.onCommand=1;
      console.log("onChange")
      var command={
        zone: this.zone,
        address:this.address,
        lamp : (this.lamp==true)?1:0, 
        mode : (this.mode==true)?1:0, 
        setpoint : this.setpoint,
        errorband : this.errorband,
      };
      this.commandSource.add(command);
      console.log(this.commandSource.at(0));
      this.commandSource.sync();
      this.commandSource.remove(this.commandSource.at(0));
      setTimeout(function(){
        zoneModel.onCommand=0;
      }, 2000);
      
    },

    onEdit: function(data){
      var index = e.sender.select().index();
      
      this.trigger("zone:edit", { 
        name : this.zoneSource.view()[index],
        type : "zone"
      });
    }
  });

var eventModel = kendo.observable({

    eventSource: new kendo.data.DataSource({
      /*schema: {
        model: { id: "id"}
      }, ??????*/
      transport: {
        read: {
          url: settingModel.host+"/service/event",
          dataType: "JSON",
          type: "GET"
        }        
      },

      requestStart: function (e){
        console.log("areaSource request START");
        //start=Date.now();
      },

      requestEnd: function (e){
        //end=Date.now();
        //console.log("Delay View : "+(end-start));
      }


    })
});

//=================================MODEL-BINDER===========================


//==================================CONTROLLER==============================


//controller for statusview
  function setFilter(e){
    zoneModel.viewactive=1;
    zoneModel.setZoneFilter(e.view.params.address);
    zoneModel.zoneSource.fetch(function(){
      var data = zoneModel.zoneSource.view();
      zoneModel.index=zoneModel.zoneSource.indexOf(data[0]);
      zoneModel.setStatusFilter(data[0]);
    });
    //})
  }
  
  function statusViewActive(){
      zoneModel.viewactive=1;  
  }
  
  //controller for schedule view
  function setScheduleFilter(e){
    scheduleModel.setFilter(e.view.params.address);
    scheduleModel.scheduleSource.read();

    //})
  }
///controller for device view
  function viewInit(){
    areaModel.areaSource.fetch(function(){
        var data = areaModel.areaSource.at(0);
        //console.log(data);
        areaModel.init(data.area);
    });
    zoneModel.zoneSource.read();
  }
  
  function deviceViewActive(){
      zoneModel.viewactive=0;  
  }

  function closeModalArea(){
    $("#modalview-area").kendoMobileModalView("close");
  }
  
  function closeModalScheduleAdd(){
    $("#modalview-schedule-add").kendoMobileModalView("close");
  }
  
  function closeModalAreaSchedule(){
      $("#modalview-areaschedule").kendoMobileModalView("close");
  }

  function closeModalZone(){
    $("#modalview-zone").kendoMobileModalView("close");
  }

(function pollStatus(){
   setTimeout(function(){
      console.log("onCommand"+zoneModel.onCommand);
      if(zoneModel.onCommand==0&&zoneModel.viewactive==1){
        zoneModel.statusSource.read(); 
     }
     pollStatus();
  }, 1000);
})();

(function pollArea(){
   setTimeout(function(){
      if(zoneModel.viewactive==0){
        areaModel.areaSource.read();  
        areaModel.deviceSource.read();
        zoneModel.zoneSource.read();
     }
      pollArea();
  }, 10000);
})();
