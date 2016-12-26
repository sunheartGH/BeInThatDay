var Utils = {
  isResOk (res) {
    if (res && res.body && res.body.meta) {
      if (res.body.meta.status=="ok"
        && res.body.meta.code==200
        && res.body.result) {

        return true;
      } else {
        console.log(res.body.meta);
        alert(res.body.meta.message);
        return false;
      }
    } else {
      console.log(res);
      return false;
    }
  },

  dateFormat(date) {
    if (date) {
      return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ":" + date.getMilliseconds();
    }
  },

  debounce(action, idle){
    var last;
    return function(){
      var ctx = this, args = arguments
      clearTimeout(last)
      last = setTimeout(function(){
          action.apply(ctx, args)
      }, idle)
    }
  },

  throttle(action, delay){
    var last = 0;
    return function(){
      var curr = +new Date()
      if (curr - last > delay){
        action.apply(this, arguments)
        last = curr
      }
    }
  },

  clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  clearToken() {
    localStorage.removeItem("token");
  },

  haveToken() {
    if (localStorage.getItem("token")) {
      return true;
    }
  },

  storeToken(token) {
    if (token) {
      localStorage.setItem("token",token);
    }
  },

  useToken(obj){
    let token = localStorage.getItem("token");
    if (obj && token) {
      obj.token = token;
    }
  },

  storeUser(user) {
    if (user && user.id) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  },

  clearUser() {
    localStorage.removeItem("user");
  },

  getUser() {
    let lu = localStorage.getItem("user");
    if (lu) {
      return JSON.parse(lu);
    }
  },

  ifUser(u) {
    let lu = this.getUser();
    if (u && lu && lu.id && (u == lu.id || u.id == lu.id)) {
      return true;
    }
  },

  getLocations() {
    let l = localStorage.getItem("locations");
    let lt = localStorage.getItem("locations_timestamp");
    if (l && lt && Date.now() - Number(lt) <= 86400000) {
      return JSON.parse(l);
    } else {
      localStorage.removeItem("locations");
      localStorage.removeItem("locations_timestamp");
    }
  },

  storeLocations(result) {
    if (result) {
      localStorage.setItem("locations", JSON.stringify(result));
      localStorage.setItem("locations_timestamp", Date.now());
    }
  },

  removeLocations() {
    localStorage.removeItem("locations");
    localStorage.removeItem("locations_timestamp");
  },

  haveUser() {
    if (this.getUser() && this.getUser().id) {
      return true;
    }
  },
  objectIdValid(value) {
    if (value && /^[0-9a-fA-F]{24}$/.test(value)) {
      return true;
    }
  },
  genCalendar (date) {
    let today = new Date(),
        ts = today.toLocaleDateString();
    date = date || today;
    let y = date.getFullYear(),
        m = date.getMonth(),
        p = new Date(y, m,0),
        c = new Date(y, m+1,0),
        n = new Date(y, m+2,0);
    let all = [];
    let start = p.getDay() == 6 ? 1 :
                  (p.getDay() == 7 ? 0 :
                    -(p.getDay()));
    for (let i = start; i <= 42; i++) {
      let _d,_i,t;
      if (i < 1) {
        _d = p;_i = p.getDate() + i;t = "pre";
      }else if (i <= c.getDate()) {
        _d = c;_i = i;t = "cur";
      } else {
        _d = n;_i = i - c.getDate();t = "nex";
      }
      let ms = _d.toISOString().slice(0, 7);
      let d = new Date(ms+ "-" +_i);
      all.push({
        day: _i,
        date: d,
        str: d.toLocaleDateString(),
        type: t
      })
    }
    let datas = []
    let week=[];
    for (let i in all) {
      if (all[i].str == ts) {
        all[i].type += " today";
      }
      week.push(all[i]);
      if (week.length == 7) {
        datas.push(week);
        week = [];
      }
    }
    let month = c.toLocaleDateString().replace('/', '-');
    month = month.slice(0, month.lastIndexOf('/'));
    return {
      datas: datas,
      month: month,
    }
  },
  UserGender: {
    woman: "woman",
    man: "man",
  }
};
