(function(global,factory){
  global.Clndr=factory;

  global.Clndr.prototype.target = {
    main: "clndr",
    bar: "bar",
    piece: "piece",
    day: "day",
    week: ["S","M","T","W","T","F","S"],
    row: "row",
    cell: "cell",
    field: ["pre","cur","nex"],
    focus: "focus",
    hide: "hide"
  };

  global.Clndr.prototype.genData = function(date){
    function ClndrData() {
      return {
        year: 0,
        month: 0,
        date: []
      }
    }
    function Assembly(c, d) {
      c.year = d.getFullYear();
      c.month = d.getMonth() + 1;
    }
    var curYear = date.getFullYear();
    var curMonth = date.getMonth();
    var genDates = [new Date(curYear, curMonth, 0),
      new Date(curYear, curMonth + 1, 0), new Date(curYear, curMonth + 2, 0)
    ];
    var clndrDatas = [ClndrData(), ClndrData(), ClndrData()];
    for (var i = genDates[0].getDay(); i >= 0 && i < 6; i--) {
      clndrDatas[0].date.push(genDates[0].getDate() - i);
    }
    for (var j = 1; j <= genDates[1].getDate(); j++) {
      clndrDatas[1].date.push(j);
    }
    for (var k = 1; k <= 6 - genDates[1].getDay(); k++) {
      clndrDatas[2].date.push(k);
    }
    if (this.more) {
      if ((clndrDatas[0].date.length +
           clndrDatas[1].date.length +
           clndrDatas[2].date.length) / 7 < 6) {
        if(this.more === this.target.field[0]){
          var tp = [].concat(clndrDatas[0].date).shift();
          if (tp) {
            for (var ii = tp -1 ; ii >= tp - 7; ii--) {
              clndrDatas[0].date.unshift(ii);
            }
          } else {
            var pDate = genDates.getDate();
            for (var iii = 6; iii >= 0 ; iii--) {
              clndrDatas[0].date.unshift(pDate - iii);
            }
          }
        }
        if(this.more === this.target.field[2]){
          var tn = [].concat(clndrDatas[2].date).pop();
          if (tn) {
            for (var jj = tn + 1; jj <= tn + 7; jj++) {
              clndrDatas[2].date.push(jj);
            }
          } else {
            for (var jjj = 1; jjj <= 7; jjj++) {
              clndrDatas[2].date.push(jjj);
            }
          }
        }
      }
    }
    for (var l = 0; l < clndrDatas.length; l++) {
      Assembly(clndrDatas[l], genDates[l]);
    }
    this.datas = clndrDatas;
    return clndrDatas;
  }

  global.Clndr.prototype.genTmpl= function(){
    var template="";
    var genWeek="";
    for(var h=0;h<this.target.week.length;h++){
      genWeek+="<div class='"+this.target.day+" "+this.target.week[h]+"'>"+this.target.week[h]+"</div>";
    }
    template+="<div id="+this.target.bar+">"+genWeek+"</div>";
    var genCell="";
    for(var i=0;i<7;i++){
      genCell+="<div class="+this.target.cell+"></div>";
    }
    var genRow="";
    for(var i=0;i<6;i++){
      genRow+="<div class='"+this.target.row+" "+i+"'>"+genCell+"</div>";
    }
    template+="<div id="+this.target.piece+">"+genRow+"</div>";
    $("#"+this.target.main).html(template);
    return template;
  }

  global.Clndr.prototype.renderTmpl = function(){
    var clndrDatas = this.datas;
    this.curMonth = clndrDatas[1].year + '-' +
                    (clndrDatas[1].month < 10 ? '0' + clndrDatas[1].month :
                      clndrDatas[1].month);
    var cells = $("#"+this.target.piece+" ."+this.target.cell);
    var rows = $("#"+this.target.piece+" ."+this.target.row);
    var dates = [];
    for (var h = 0; h < clndrDatas.length; h++) {
      for (var i = 0; i < clndrDatas[h].date.length; i++) {
        dates.push({
          // data: clndrDatas[h].date[i],
          date: clndrDatas[h].year+'-'+
                (clndrDatas[h].month < 10 ? '0' + clndrDatas[h].month :
                  clndrDatas[h].month)+'-'+
                (clndrDatas[h].date[i] < 10 ? '0' + clndrDatas[h].date[i] :
                  clndrDatas[h].date[i]),
          class: this.target.cell+" "+this.target.field[h]
        });
      }
    }

    if (!this.more) {
      for(var j=0;j<dates.length/7;j++){
        var isRowShow = $(rows[j]).hasClass(this.target.hide);
        if(isRowShow){ $(rows[j]).removeClass(this.target.hide);}
      }
      for(;j<rows.length;j++){
        var isRowHide = $(rows[j]).hasClass(this.target.hide);
        if(!isRowHide){ $(rows[j]).addClass(this.target.hide);}
      }
    }
    for(var k=0;k<dates.length;k++){
      // $(cells[k]).attr('day', dates[k].data);
      $(cells[k]).attr("date",dates[k].date);
      var classHad = dates[k].class.split(' ').pop();
      var isClassHad = $(cells[k]).hasClass(classHad);
      if(!isClassHad){
        for (var l = 0; l < this.target.field.length; l++) {
          var isRowHide = $(cells[k]).hasClass(this.target.field[l]);
          if(isRowHide){ $(cells[k]).removeClass(this.target.field[l]);}
        }
        $(cells[k]).addClass(classHad);
      }
    }
    this.monBegin = dates[0].date;
    this.monEnd = dates[dates.length - 1].date;
  }

  global.Clndr.prototype.clearFocus = function(){
    if(this.focusDates){
      var cells = this.datePicker(null);
      if(cells){
        for(var i = 0; i<cells.length; i++){
          if($(cells[i]).hasClass(this.target.focus)){
            if(this.focusOnClear){
              this.focusOnClear(cells[i]);
              $(cells[i]).removeClass(this.target.focus);
            }
          }
        }
      }
    }
  }

  global.Clndr.prototype.loadFocus = function(){
    if(this.focusDates){
      var cells = this.datePicker(this.focusDates);
      for (var i = 0; i < cells.length; i++) {
        $(cells[i]).addClass(this.target.focus);
        if(this.focusOnLoad){
          var cellDate = new Date($(cells[i]).attr('date'))
          var cellFullYear = cellDate.getFullYear();
          var cellMonth = cellDate.getMonth();
          for(var j = 0; j < this.focusDates.length; j++){
            if(cellFullYear == this.focusDates[j].getFullYear() &&
                cellMonth == this.focusDates[j].getMonth()){
              this.focusOnLoad(cells[i]);
            }
          }
        }
      }
    }
  }

  global.Clndr.prototype.setFocus = function(dates,onLoad,onClear){
    if(dates instanceof Array){
      this.focusDates = dates;
    }
    if((typeof onLoad == 'function') && (typeof onClear == 'function')){
      this.focusOnLoad = onLoad;
      this.focusOnClear = onClear;
    }
  }

  global.Clndr.prototype.datePicker = function(dates){
    var datepicker = [];
    if(!this.cells){
      this.cells =  $("#" + this.target.piece + " ." +this.target.row + ">[date]");
    }
    var cells = this.cells;
    if(dates == null){
      for(var h = 0; h < cells.length; h++){
        datepicker.push(cells[h]);
      }
    }else{
      for (var i = 0; i < cells.length; i++) {
        var data = $(cells[i]).attr("date");
        for (var j = 0; j < dates.length; j++) {
          var dateStr = dates[j].getFullYear() + "-" + (dates[j].getMonth()+1) +"-" + dates[j].getDate();
          if (dateStr == data.toString()) {
            datepicker.push(cells[i]);
          }
        }
      }
    }
    return datepicker;
  }

  function util4To(obj,date){
    obj.genData(date);
    obj.clearFocus();
    obj.renderTmpl();
    obj.loadFocus();
  }

  global.Clndr.prototype.toPre = function(){
    var tempDate = new Date(this.curMonth);
    tempDate = new Date(tempDate.setMonth(tempDate.getMonth()-1));
    util4To(this,tempDate);
  }

  global.Clndr.prototype.toCur = function(){
    util4To(this,new Date());
  }

  global.Clndr.prototype.toNex = function(){
    var tempDate = new Date(this.curMonth);
    tempDate = new Date(tempDate.setMonth(tempDate.getMonth()+1));
    util4To(this,tempDate);
  }

  global.Clndr.prototype.init = function(newDate, more){
    var self=this;
    if (more) {
      if (this.target.field.indexOf(more) > -1) {
        self.more = more;
      } else {
        console.log('more should in pre or nex');
        return;
      }
    }
    self.genData(newDate);
    self.genTmpl();
    self.renderTmpl();
  }
}(this, function(date, more){
  if(!$){
    console.log('Clndr needs jquery.js!');
    return null;
  }
  if(date){
    this.init(date, more);
  }
}));
