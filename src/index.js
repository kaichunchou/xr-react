import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import axios from 'axios';


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

    createOptions()
    {
       let options = [];
        for (let i = 0; i < this.props.options.length; i++)
        {
            options.push(<option value={this.props.options[i][0]}>{this.props.options[i][0]}</option>);
        }
        return options;
    }

    render(){
        return (
            <div>
               <select onChange={this.change.bind(this)}>
                    {this.createOptions()}
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
            fetched_data: null, //2 dimentional array => [][0]=currency name, [][1]=value
            count: 0,
            //fetch_data: test,
        }
    }
    onChange(type, value){
        if (type === "currency_from"){
            this.setState({
                currencyfrom: value,
            });
        }
        else if (type === "currency_to"){
            this.setState({
                currencyto: value,
            });
        }
    }

    componentDidMount() {
        axios.get('http://api.fixer.io/latest')
          .then(function (response) {
              console.log(response.data);
              
              var data = new Array();
              for(var i in response.data.rates){
                  var pair = new Array();
                  pair.push(i); //add key
                  pair.push(response.data.rates[i]); //add value
                  data.push(pair);
              }

              var pair = new Array(); //add currency from data.base
              pair.push(response.data.base);
              pair.push(1);
              data.push(pair);
              
              data.sort(sortFunction); //sort 2d array

              this.setState({
                  fetched_data: data,
              });

          }.bind(this))
          .catch(function (error) {
              console.log(error);
          });
        var temp = this.state.count + 1;
        this.setState({
            count: temp
        });
    }

    render() {
        let from, to;
        from = "Currecny from: " + (this.state.currencyfrom === "select" ? '' : this.state.currencyfrom);
        to = "Currecny to: " + (this.state.currencyto === "select" ? '' : this.state.currencyto);
        
        if (!this.state.fetched_data) {
            return <div>Loading</div>;
        }

        var data_1 = [];
        var data_2 = [];
        for (var i = 0; i < this.state.fetched_data.length; i++){
            data_1[i] = this.state.fetched_data[i].slice();
            data_2[i] = this.state.fetched_data[i].slice();
        }

        return (
            <div>
                <Dropdown type = "currency_from" options = {data_1} onChange={this.onChange.bind(this)} />
                    <div>{from}</div>
                    <Dropdown type = "currency_to" options = {data_2} onChange={this.onChange.bind(this)} />
                    <div>{to}</div>
                    <div>{this.state.fetched_data[8][0]}</div>
                    <div>{this.state.count}</div>
                    <div>{data_1[31][1]}</div>
                    <div>{data_1.length}</div>
            </div>
        );
    }
}

function sortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}

ReactDOM.render(
  <Form />,
  document.getElementById('root')
);
