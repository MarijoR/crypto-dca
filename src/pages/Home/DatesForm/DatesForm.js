import React, { Component } from "react";
import "./DatesForm.css";

import moment from "moment";

import ButtonDropdown from "../../../ui/ButtonDropdown/ButtonDropdown";
import TextInput from "../../../ui/TextInput/TextInput";
import DatePicker from "../../../ui/DatePicker/DatePicker";
import Button from "../../../ui/Button/Button";
import APIURL from "../../../constants/API";

class DatesForm extends Component {
  state = {
    frequency: null,
    amount: null,
    startDate: null,
    endDate: null
  };

  _updateAmount = value => {
    this.setState({
      amount: value.target.value
    });
  };

  _updateFrequency(value) {
    this.setState({
      frequency: value
    });
  }
  handleChange(value, type) {
    this.setState({
      [type]: value
    });
  }

  async getCoinData() {
    const { startDate, endDate } = this.state;

    const dateString = `?start=${startDate.format(
      "YYYY-MM-DD"
    )}&end=${endDate.format("YYYY-MM-DD")}`;
    const url = `${APIURL}${dateString}`;

    const coinRepsonse = await fetch(url);
    const coinJson = await coinRepsonse.json();
    return coinJson;
  }

  async handleSubmit() {
    const { frequency, amount } = this.state;
    const coinData = await this.getCoinData();
  }

  render() {
    const { frequency, amount, startDate, endDate } = this.state;

    const frequencyTypes = [
      "Everyday",
      "Every Other Day",
      "Every Week",
      "Every Two Weeks",
      "Every Month",
      "Every Two Months"
    ];
    const btcStart = "2009-01-12";
    const coindeskStart = "2010-07-17";

    return (
      <div className="DatesForm">
        <div className="row between-xs DatesForm__row">
          <TextInput onChange={this._updateAmount} value={amount} />
          <ButtonDropdown
            value={frequency}
            onChange={value => this._updateFrequency(value)}
            menuItems={frequencyTypes}
          />
        </div>
        <div className="row between-xs DatesForm__row">
          <DatePicker
            selected={startDate}
            onChange={value => this.handleChange(value, "startDate")}
            openToDate={moment(coindeskStart)}
            minDate={moment(coindeskStart)}
            maxDate={moment().subtract(1, "day")}
            placeholderText="Start Date"
            className="TextInput__input"
            label="Start Date"
          />
          <DatePicker
            selected={endDate}
            onChange={value => this.handleChange(value, "endDate")}
            minDate={moment(coindeskStart).add(1, "day")}
            maxDate={moment()}
            placeholderText="End Date"
            todayButton={"Today"}
            className="TextInput__input"
            label="End Date"
          />
        </div>
        <div className="row center-xs">
          <Button text={"Submit"} onClick={() => this.handleSubmit()} />
        </div>
      </div>
    );
  }
}

export default DatesForm;
