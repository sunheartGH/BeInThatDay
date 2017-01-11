<template>
<div>
  <div id="uinfos" class="ui six item stackable tabs menu">
    <a class="active item" data-tab="activitys">Activitys</a>
    <a class="item" data-tab="comments">Comments</a>
    <a class="item" data-tab="friends" v-show="showSelfs">Friends</a>
    <a class="item" data-tab="follows">Follows</a>
    <a class="item" data-tab="followeds">Followeds</a>
    <a class="item" data-tab="messages" v-show="showSelfs">Messages</a>
  </div>
  <div class="ui bottom attached active tab segment" data-tab="activitys">
    <app-uactivitys :userid='userid'></app-uactivitys>
  </div>
  <div class="ui bottom attached tab segment" data-tab="comments">
    <app-ucomments :userid='userid'></app-ucomments>
  </div>
  <div class="ui bottom attached tab segment" data-tab="friends" v-show="showSelfs">
    <app-urelations :userid='userid' :rtype='friend'></app-urelations>
  </div>
  <div class="ui bottom attached tab segment" data-tab="follows">
    <app-urelations :userid='userid' :rtype='follow'></app-urelations>
  </div>
  <div class="ui bottom attached tab segment" data-tab="followeds">
    <app-urelations :userid='userid' :rtype='followed'></app-urelations>
  </div>
  <div class="ui bottom attached tab segment" data-tab="messages" v-show="showSelfs">
    <app-umessages :userid='userid'></app-umessages>
  </div>
</div>
</template>

<script>
import bus from "bus";
import utils from "utils";
import UserActivitys from "./user_activitys.vue";
import UserComments from "./user_comments.vue";
import UserMessages from "./user_messages.vue";
import UserRelations from "./user_relations.vue";

export default {
  data () {
    return {
      friend:"friend",
      follow:"follow",
      followed:"followed",
      showSelfs: false,
    }
  },
  activated() {
  },
  mounted() {
    this.changeTab();
    this.showInfos();
  },
  methods: {
    changeTab(tab) {
      tab = tab || this.show;
      if (tab) {
        $("#uinfos").tab('change tab', tab);
        $('#uinfos .item').tab();
      } else {
        $('#uinfos .item').tab();
        $('#uinfos').tab();
      }
    },
    showInfos() {
      if (utils.ifUser(this.userid)) {
        $('#uinfos').removeClass("four");
        $('#uinfos').addClass("six");
        this.showSelfs = true;
      } else {
        $('#uinfos').removeClass("six");
        $('#uinfos').addClass("four");
        this.showSelfs = false;
      }
    },
  },
  props: ["userid", "show"],
  watch: {
    userid() {
      this.showInfos();
    },
    show(val) {
      this.changeTab(val);
    }
  },
  components: {
    "app-uactivitys": UserActivitys,
    "app-ucomments": UserComments,
    "app-umessages": UserMessages,
    "app-urelations": UserRelations,
  },
}
</script>

<style>
.ui.bottom.attached.tab.segment {
  border: 0;
}
.ui.item.tabs.menu {
  border: 0;
  border-radius: 0;
  margin-top: 1rem;
  margin-bottom: 0;
}
.ui.item.tabs.menu .item[data-tab="activitys"] {
  color: #fff;
  background-color: #F2711C;
  border-radius: 0;
}
.ui.item.tabs.menu .item[data-tab="activitys"]:hover {
  color: #fff;
  background-color: #f26202;
  border-radius: 0;
}
.ui.item.tabs.menu .item[data-tab="comments"] {
  color: #fff;
  background-color: #6435C9;
  border-radius: 0;
}
.ui.item.tabs.menu .item[data-tab="comments"]:hover {
  color: #fff;
  background-color: #5829bb;
  border-radius: 0;
}
.ui.item.tabs.menu .item[data-tab="friends"] {
  color: #fff;
  background-color: #00B5AD;
  border-radius: 0;
}
.ui.item.tabs.menu .item[data-tab="friends"]:hover {
  color: #fff;
  background-color: #009c95;
  border-radius: 0;
}
.ui.item.tabs.menu .item[data-tab="follows"] {
  color: #fff;
  background-color: #DB2828;
  border-radius: 0;
}
.ui.item.tabs.menu .item[data-tab="follows"]:hover {
  color: #fff;
  background-color: #d01919;
  border-radius: 0;
}
.ui.item.tabs.menu .item[data-tab="followeds"] {
  color: #fff;
  background-color: #2185D0;
  border-radius: 0;
}
.ui.item.tabs.menu .item[data-tab="followeds"]:hover {
  color: #fff;
  background-color: #1678c2;
  border-radius: 0;
}
.ui.item.tabs.menu .item[data-tab="messages"] {
  color: #fff;
  background-color: #A333C8;
  border-radius: 0;
}
.ui.item.tabs.menu .item[data-tab="messages"]:hover {
  color: #fff;
  background-color: #9627ba;
  border-radius: 0;
}
/*#E03997 #e61a8d #FBBD08 #eaae00 #21BA45 #16ab39 #A5673F #975b33 #767676 #838382 #1B1C1D #27292a*/
/*semantic-ui button colors: red orange yellow olive green teal blue violet purple pink brown grey black */
</style>
