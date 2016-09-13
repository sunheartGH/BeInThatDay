function queryUrlParam(queryName, urlParam) {
  return new RegExp('[\?&]' + queryName + '=([^&#]*)').exec(urlParam)[1]||0;
}
var dayParam = queryUrlParam('day', window.location.href);

var ActOne = React.createClass({
  actClick: function (actId) {
    var self = this;
    $.get('/acts/' + actId + '?post=1', function (result) {
      self.setState({post: result.post});
    });
  },
  incFavor: function (actId) {
    this.setState({favor: this.state.favor + 1});
    $.ajax({
      url: '/acts/' + actId + '/favor',
      type: 'put',
      success: function (data) {
        alert(data);
      }
    })
  },
  getInitialState: function () {
    return this.props.act;
  },
  render: function () {
    return (
      <li>
        <div>
          <div onClick={()=>this.actClick(this.state._id)}>{this.state.title}</div>
          <div>{this.state.author}</div>
          <div>{this.state.site}</div>
          <div>{this.state.post}</div>
        <div>
        </div>
          <span>favor: {this.state.favor}</span>
          <a href="#" onClick={()=>this.incFavor(this.state._id)}>add</a>
        </div>
      </li>
    );
  }
});

var ActsList = React.createClass({
  getInitialState: function () {
    return {
      acts: []
    }
  },
  componentDidMount: function () {
    $.get(this.props.href, function (result) {
      if (this.isMounted()) {
        this.setState({
          acts: result
        });
      }
    }.bind(this));
  },
  render: function () {
    var createAct = function (act) {
      return (
        <ActOne act={act}/>
      );
    }
    return (
      <div>
        <h1>Acts :</h1>
        <ul>{this.state.acts.map(createAct)}</ul>
      </div>
    );
  }
});

ReactDOM.render(
  <ActsList href={'/acts/day/' + dayParam} />,
  $('#actsList')[0]
);
