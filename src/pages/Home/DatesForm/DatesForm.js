import React, { Component } from "react";
import "./DatesForm.css";
import DatePicker from "react-datepicker";
import moment from "moment";

import "../../../../node_modules/react-datepicker/dist/react-datepicker.css";

import ButtonDropdown from "../../../ui/ButtonDropdown/ButtonDropdown";

class DatesForm extends Component {
  state = {
    frequency: null,
    amount: null,
    startDate: null,
    endDate: null
  };

  _updateValue(type, value) {
    this.setState({
      [type]: value.target.value
    });
  }

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

  render() {
    const { frequency, startDate, endDate } = this.state;

    const frequencyTypes = [
      "Everyday",
      "Every Other Day",
      "Every Week",
      "Every Two Weeks",
      "Every Month"
    ];

    return (
      <div>
        <h1>Bitcoin DCA</h1>
        <ButtonDropdown
          value={frequency}
          onChange={value => this._updateFrequency(value)}
          menuItems={frequencyTypes}
        />
        <input
          placeholder="How much?"
          type="number"
          onChange={e => this._updateValue("amount", e)}
        />
        <DatePicker
          selected={startDate}
          onChange={value => this.handleChange(value, "startDate")}
          showMonthDropdown
          showYearDropdown
          openToDate={moment("2009-01-12")}
          minDate={moment("2009-01-12")}
          maxDate={moment().subtract(1, "day")}
          placeholderText="Start Date"
        />
        <DatePicker
          selected={endDate}
          onChange={value => this.handleChange(value, "endDate")}
        />
      </div>
    );
  }
}

export default DatesForm;
