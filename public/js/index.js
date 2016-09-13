var clndr=new Clndr(new Date(), 'nex');

$('.cell').each(function (index, element ) {
  $(element).attr('cusdatectrl', '');
  $(element).attr('datectrl', 'dc' + index);
});

var app = angular.module('calendarApp',[]);

app.controller('titleCtrl', ['$scope', '$http', function ($scope, $http) {
  function titleInCtrl() {
    $scope.curMonth = clndr.curMonth;
    var getUrl = "/acts/mon/"+ clndr.curMonth + "?de=" + clndr.monBegin + "&to=" + clndr.monEnd;
    $http.get(getUrl).success(function (res) {
      $('.cell').each(function (index, elmCell ) {
        $scope[$(elmCell).attr('datectrl')] = {day: moment($(elmCell).attr('date')).date()};
      });
      for (var oneData of res) {
        var actdayStr = moment(oneData.actday).format('YYYY-MM-DD');
        var elmActday = $(".cell[date='" + actdayStr + "']");
        oneData.day = moment(elmActday.attr('date')).date();
        oneData.date = actdayStr;
        $scope[elmActday.attr('datectrl')] = oneData;
      }
    });
  }
  $scope.clickBar = function (tag) {
    if (tag == 'left') {
      clndr.toPre();
    } else if (tag == 'right') {
      clndr.toNex();
    }
    titleInCtrl();
  }
  titleInCtrl();
}]);

app.directive('cusdatectrl', ['$http', function ($http) {
  return {
    restrict: 'A',
    scope: {
      datectrl: '='
    },
    template: `
      <div>
        <div ng-click="focusDay()">
          <a ng-if="!datectrl.date">{{datectrl.day}}</a>
          <a ng-if="datectrl.date" href="/acts.html?day={{datectrl.date}}" target="_blank">{{datectrl.day}}</a><br/>
          <span>{{datectrl.title}}</span>
          <img src="{{datectrl.icon}}"/>
        </div>
      </div>
    `,
    replace: true,
    link: function (scope, element) {
      scope.focusDay = function () {
        $http.get('/acts/' + scope.datectrl._id).success(function (res) {
          if (res) {
            res.actday = moment(res.actday).format('YYYY-MM-DD')
            scope.$parent.focus = res;
          }
        })
      }
    }
  }
}]);
