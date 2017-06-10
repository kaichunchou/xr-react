import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
/*
var MySelect = React.createClass({
    getInitialState: function() {
        return {
            value: 'select'
        }
    },
    change: function(event){
        this.setState({value: event.target.value});
    },
    render: function(){
        return(
           <div>
               <select id="lang" onChange={this.change} value={this.state.value}>
                  <option value="select">Select</option>
                  <option value="Java">Java</option>
                  <option value="C++">C++</option>
               </select>
               <p></p>
               <p>{this.state.value}</p>
           </div>
        );
}
});

        ReactDOM.render(
          <MySelect />,
          document.getElementById('root')
        );
*/
class Dropdown extends React.Component {
    constructor(){
        super();
        this.state = {
            //type: this.props.type,
            //value: 'select', //store currencyfrom, currencyto
        };
    }

    change(event){
        const value = event.target.value;
        this.props.onChange(this.props.type, value);
    }

    render(){
        return (
            <div>
                <select onChange={this.change.bind(this)}>
                    <option value="select">Select</option>
                    <option value="A">Apple</option>
                    <option value="B">Banana</option>
                    <option value="C">Cranberry</option>
                </select>
            </div>
            
        );
    }
}

class Form extends React.Component {
    constructor() {
        super();
        this.state = {
            currencyfrom: "select",
            currencyto: "select",
        }
    }
    onChange(type, value){
        if (type == "currency_from"){
            this.setState({
                currencyfrom: value,
            });
        }
        else if (type == "currency_to"){
            this.setState({
                currencyto: value,
            });
        }
    }

    render() {
        let from, to;
        from = "Currecny from: " + (this.state.currencyfrom == "select" ? '' : this.state.currencyfrom);
        to = "Currecny to: " + (this.state.currencyto == "select" ? '' : this.state.currencyto);

        return (
            <div>
                <Dropdown type = "currency_from" onChange={this.onChange.bind(this)} />
                <div>{from}</div>
                <Dropdown type = "currency_to" onChange={this.onChange.bind(this)} />
                <div>{to}</div>
            </div>
        );
    }
}

ReactDOM.render(
  <Form />,
  document.getElementById('root')
);
