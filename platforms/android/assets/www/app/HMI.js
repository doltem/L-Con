//==================================VARIABLES====================================
var host="http://192.168.0.101";
var start=0;
var end=0;
//==================================MODELS===================================
//model fore Setting View
var settingModel = kendo.observable({
    host:"http://192.168.0.101",

    onChange: function (e){       
        zoneModel.set("zoneSource.options.transport.read.url",this.host+"/service/status");
        zoneModel.zoneSource.read();
        
        zoneModel.set("statusSource.options.transport.read.url",this.host+"/service/status");
        zoneModel.statusSource.read();
        
        zoneModel.set("commandSource.options.transport.create.url",this.host+"/service/command");
    }
});

//Model for Zone Dropdown List
var zoneModel = kendo.observable({
    address:"00 13 a2 00 40 a6 1f cd",
    zone:"Ruang Utama",
    amode:true,
    lmode:true,
    arelay:false,
    lrelay:false,
    occ: 1,
    temp:27.6,
    hum:60.7,
    lux:27,
    aset:25,
    aerror:0,
    lset:500,
    lerror:0,
    index:0,
    
    onCommand:0,
    viewactive:0,

    zoneSource: new kendo.data.DataSource({
      transport: {
        read: {
          url: settingModel.host+"/service/status",
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
        //console.log("Delay List Status : "+(end-start));
      },



      filter: { field: "address", operator: "eq", value: "" }

    }),

    statusSource: new kendo.data.DataSource({
      schema: { model: {} },
      transport: {
        read: {
          url: settingModel.host+"/service/status",
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
          url: settingModel.host+"/service/command",
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
      this.set("amode",(data.amode==0)?false:true);
      this.set("lmode",(data.lmode==0)?false:true);
      this.set("arelay",(data.arelay==0)?false:true);
      this.set("lrelay",(data.lrelay==0)?false:true);
      this.set("occ",(data.occ==0)?"UNOCCUPIED":"OCCUPIED");
      this.set("temp",data.temp);
      this.set("hum",data.hum);
      this.set("lux",data.lux);
      this.set("aset",data.aset);
      this.set("aerror",data.aerror);
      this.set("lset",data.lset);
      this.set("lerror",data.lerror);
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
    
    onChangeL: function(){
        this.set("lmode",false);
        this.onChange();
    },

    onChangeA: function(){
        this.set("amode",false);
        this.onChange();
    },
    
    onChange: function(){
      zoneModel.onCommand=1;
      console.log("onChange")
      var command={
        address:this.address,
        amode : (this.amode==true)?1:0, 
        lmode : (this.lmode==true)?1:0, 
        arelay : (this.arelay==true)?1:0, 
        lrelay : (this.lrelay==true)?1:0, 
        aset : this.aset,
        aerror : this.aerror,
        lset : this.lset,
        lerror : this.aerror,
      };
      this.commandSource.add(command);
      console.log(this.commandSource.at(0));
      this.commandSource.sync();
      this.commandSource.remove(this.commandSource.at(0));
      setTimeout(function(){
        zoneModel.onCommand=0;
      }, 5000);
      
    },

    onEdit: function(data){
      var index = e.sender.select().index();
      
      this.trigger("zone:edit", { 
        name : this.zoneSource.view()[index],
        type : "zone"
      });
    }
  });


//=================================MODEL-BINDER===========================


//==================================CONTROLLER==============================


//controller for statusview
  function setFilter(e){
    zoneModel.viewactive=1;
    /*zoneModel.setZoneFilter(e.view.params.address);
    zoneModel.zoneSource.fetch(function(){
      var data = zoneModel.zoneSource.view();
      zoneModel.index=zoneModel.zoneSource.indexOf(data[0]);
      zoneModel.setStatusFilter(data[0]);
    });*/
    //})
  }
  
  function statusViewActive(){
      zoneModel.viewactive=1;  
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
  }, 3000);
})();

