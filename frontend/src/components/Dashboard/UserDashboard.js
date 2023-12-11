import React, { Component } from "react";

import "./UserDashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";
// Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import moment from 'moment';

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Snackbar from "@material-ui/core/Snackbar";
import CloseIcon from "@material-ui/icons/Close";
import TextField from "@material-ui/core/TextField";
import AuthServices from "../../configurations/AuthServices";

import Pagination from "@material-ui/lab/Pagination";

const authServices = new AuthServices();
const minDate = new Date(Date.now());
// const customerServices = new CustomerServices();

export default class FarmerDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Message: "",
      NumberOfRecordPerPage: 6,
      PageNumber: 0,
      TotalPages: 0,
      TotalRecords: 0,
      OpenLoader: false,
      OpenSnackBar: false,

      TrackingIDData: true,

      MyOrderData: [],
      OrderDetails: true,
      CourierNameFlag: false,
      CouierWeightFlag: false,
      SourceFlag: false,
      DestinationFlag: false,
      CurrentDateFlag: false,
      CourierName: "",
      CouierWeight: "",
      Source: "",
      Destination: "",
      CurrentDate: "",
      OrderDetailsCourier: [],
      SourceFlag: false,
      DestinationSeed: "",
      DestinationSeedFlag: false,
      TrackingID: "",
      CourierType: "",
      CourierTypeFlag: false,
      CurrentLocationFlag: false,
      CurrentLocation: "",
      PaymentDetails: true,
      PaymentDetailsFlag: false,
      PaymentDetailUPI: "",
      PaymentType: "",
      PaymentTypeFlag: false,
      Kilometer: "",
      KilometerFlag: false,
      BillDetailsData: false,
      OrderCourierFlag: true,
      TrackCourierFlag: false,
      BillingListFlag: false,
      MyOrder: false,
      CourierData:{},
      TrackDataArr: {},
      AmountCalculate:0
    };
  }

  handlePluseIcon = () => {
    this.setState({
      OrderDetails: false,
      PaymentDetails: true
    })
  }

  handleSnackBarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    this.setState({ OpenSnackBar: false });
  };

  handlePaging = async (e, value) => {
    const {OrderCourierFlag, TrackCourierFlag, BillingListFlag, FeedbackFlag} = this.state
    console.log("Current Page : ", value);
    this.setState({
      PageNumber: value,
    });

    if (OrderCourierFlag) {
      await this.GetAllFarmerData(value);
    }
    if (TrackCourierFlag) {
      await this.GetAllSeedDetails(value);
    }
    if (BillingListFlag) {
      await this.getAllExporterDetails(this.state.PageNumber)
    }
  };

  SignOut = async () => {
    await localStorage.removeItem("token");
    this.props.history.push("/SignIn");
  };

  /////////////////////////////////////COURIER MANAGEMENT////////////////////////////////////////////////////
  CheckValidationTrackingID = () => {
    const { TrackingID } = this.state
    console.log("CheckValidation Calling...");
    let isValid = true
    if (TrackingID === "") {
      this.setState({
        TrackingIDFlag: true
      })
      isValid = false
    }
    return isValid;
  }

  handleTrackingSubmit = (e) => {
    e.preventDefault();

    let isvalid = this.CheckValidationTrackingID()
    if (isvalid) {
      this.setState({ OpenLoader: true })
      authServices
        .TRackCourierDetails(this.state.TrackingID)
        .then((data) => {
          console.log("trackData", data.data);
          this.setState({
            TrackDataArr: data.data.data,
            TrackingIDData: false,
            OpenLoader: false,
            OpenSnackBar: true,
            Message: data.data.message,
            orderId: data.data.data.id
          })
        })
        .catch((error) => {
          this.setState({ OpenLoader: false });
        });
    }
  }

handlePayentModeInput=()=>{
  let isvalid= true;
  if(this.state.PaymentType === ""){
    document.getElementById("PaymentType").classList.add("validation")
    isvalid=false
  }
  if(this.state.PaymentType != ""){
    if(this.state.PaymentDetailUPI === ""){
      document.getElementById("PaymentDetailUPI").classList.add("validation")
      isvalid=false
    }
  }
  return isvalid;
}

  handleSubmitDetailsPaymentDetails = (e) => {
  e.preventDefault()
  let isvalid = this.handlePayentModeInput()
  if(isvalid){
    let res = {
      "id": 0,
      "source": this.state.Source?.toString(),
      "destination": this.state.Destination?.toString(),
      "weight": this.state.CourierType === "HOUSEHOLD" || this.state.CourierType === "OFFICE" ? 50 : parseInt(this.state.CouierWeight),
      "distance": parseInt(this.state.Kilometer),
      "amount": parseInt(this.state.AmountCalculate),
      "createdOn": this.state.CurrentDate?.toString(),
      "expectedDeliveryDate": this.state.CurrentDate?.toString(),
      "paymentMode": this.state.PaymentType?.toString(),
      "paymentDetails": this.state.PaymentDetailUPI?.toString(),
      "currentLocation": this.state.CurrentLocation,
      "status": "PENDING",
      "orderType": this.state.CourierType?.toString()

    }
    authServices
      .CreateCourierService(res)
      .then((data) => {
        console.log("filedata : ", data);  
        if (data.data.data !== null) {
          this.setState({
            CourierData: data.data.data,
            Destination: "",
            CouierWeight: "",
            Source: "",
            CurrentDate: "",
            OrderDetails: true,
            BillDetailsData: false,
            paymentPage: false,
            OpenLoader: false,
            OpenSnackBar: true,
            Message: data.data.message
          });
        }
      })
      .catch((error) => {
        console.log("GetUserAppointments Error : ", error);
        this.setState({ OpenLoader: false });
      });
    }
  }


  handleInputChangeCourier = (e) => {
    let val = e.target.value

    if (e.target.name === "CourierType") {
      this.setState({
        CourierType: e.target.value,
      })
      document.getElementById("CourierType").classList.remove("validation")
    }
    if(this.state.CourierType === "OTHER"){
    if (e.target.name === "CouierWeight") {
      this.setState({
        CouierWeight: e.target.value,
      })
      document.getElementById("CouierWeight").classList.remove("validation")
    }}
    if (e.target.name === "Source") {
      this.setState({
        Source: e.target.value,
        SourceFlag: false
      })
    }
    if (e.target.name === "Destination") {
      this.setState({
        Destination: e.target.value,
        DestinationFlag: false
      })
    }
    if (e.target.name === "CurrentDate") {
      this.setState({
        CurrentDate: e.target.value,
        CurrentDateFlag: false
      })
    }
    if (e.target.name === "Kilometer") {
      this.setState({
        Kilometer: e.target.value,
        KilometerFlag: false
      })
    }
    if (e.target.name === "PaymentType") {
      this.setState({
        PaymentType: e.target.value,
        PaymentTypeFlag: false
      })
    }
    if (e.target.name === "CurrentLocation") {
      this.setState({
        CurrentLocation: e.target.value,
        CurrentLocationFlag: false
      })
    }


    this.setState({
      [e.target.name]: e.target.value
    })

  }

  CheckValidationCourier = () => {
    const { CourierName, CouierWeight, Source, Destination, CurrentDate, CourierType, CurrentLocation, Kilometer, VehicalName, SourceVehicle, PriceVehicle, NoOfDays } = this.state
    console.log("CheckValidation Calling...");


    let isValid = true;
    // this.setState({ EmailIDFlag: false, DestinationFlag: false });

    if (CourierType === "OTHER") {
      if (CouierWeight === "") {
        isValid = false
        document.getElementById("CouierWeight").classList.add("validation")
              }
    }
    if (Source === "") {
      isValid = false
      this.setState({
        SourceFlag: true
      })

    }
    if (Destination === "") {
      isValid = false
      this.setState({
        DestinationFlag: true
      })

    }
    if (CurrentDate === "") {
      isValid = false
      this.setState({
        CurrentDateFlag: true
      })

    }
    if (Kilometer === "") {
      isValid = false
      this.setState({
        KilometerFlag: true
      })

    }
    if (CourierType === "") {
      isValid = false
      document.getElementById("CourierType").classList.add("validation")
     

    }
    if (CurrentLocation === "") {
      isValid = false
      this.setState({
        CurrentLocationFlag: true
      })

    }

    return isValid;


  }

  handleProductCuorierSubmit = (e) => {
    e.preventDefault()

    let isvalid = this.CheckValidationCourier()

    if (isvalid) {
      
      let res = {
        "weight": this.state.CourierType === "HOUSEHOLD" || this.state.CourierType === "OFFICE" ? 50 : parseInt(this.state.CouierWeight),
        "distance": parseInt(this.state.Kilometer),
        "orderType": this.state.CourierType?.toString(),
        "amount": 0
      }
      authServices
        .CalculatedAmountForWeight(res)
        .then((data) => {
          console.log("filedata : ", data);
          
          if (data.data.data !== null) {
  
            this.setState({
              AmountCalculate:data.data.data.amount,
              PaymentDetails: false,
              BillDetailsData: true
            })
  
          }
        })
        .catch((error) => {
          console.log("GetUserAppointments Error : ", error);
          this.setState({ OpenLoader: false });
        });
     
    
    }
  }

  handleTrackingSubmitInput = (e) => {
    // e.preventDefault();
    if (e.target.name === "TrackingID") {
      this.setState({
        TrackingID: e.target.value,
        TrackingIDFlag: false
      })
    }


    this.setState({
      [e.target.name]: e.target.value
    })

  }

  CustomerOrderCourier = () => {

    authServices
      .CustomerOrderCourier()
      .then((data) => {
        console.log("GetUserAppointments Data : ", data);
        // debugger
        if (data.data.data !== null) {

          this.setState({
            OrderDetailsCourier: data.data.data,

            OpenLoader: false,
          });
        }
      })
      .catch((error) => {
        console.log("GetUserAppointments Error : ", error);
        this.setState({ OpenLoader: false });
      });
  }

  handleOrderCourierFlag = () => {

    this.setState({
      OrderCourierFlag: true,
      TrackCourierFlag: false,
      MyOrder: false,

    });
  };

  handleTrackCourierFlag = () => {
    this.setState({
      OrderCourierFlag: false,
      TrackCourierFlag: true,
      MyOrder: false
    });

  }


  handleMyOrder = () => {
    this.setState({
      OrderCourierFlag: false,
      TrackCourierFlag: false,
      MyOrder: true,
    });
    this.CustomerOrderCourier()
  }

  handleCanel=()=>{
    window.location.reload()
  }
  render() {
    const { CourierData, PaymentType, PaymentTypeFlag, PaymentDetailUPI, PaymentDetailsFlag, PaymentDetails, CurrentLocation, CurrentLocationFlag, CourierTypeFlag, CourierType, CourierNameFlag, CourierName, CouierWeightFlag, CouierWeight, Source, SourceFlag, Destination, DestinationFlag, TrackingIDFlag, TrackingID, DestinationSeedFlag, DestinationSeed,
      TrackingIDData, TrackDataArr, Kilometer, KilometerFlag, OrderDetailsCourier,
      CurrentDate, CurrentDateFlag, OrderCourierFlag,
      OpenSnackBar, Message, TrackCourierFlag, MyOrder, OrderDetails } = this.state
    return (
      <div className="UserDashBoard-Container">
        <div className="Sub-Container">
          <div className="Header">
            <AppBar position="static" style={{ backgroundColor: "#7a4205" }}>
              <Toolbar>
                <Typography
                  variant="h6"
                  style={{
                    flexGrow: 3,
                    display: "flex",
                    padding: "5px 0 0 21px",
                    boxSizing: "border-box",
                    fontSize: "23px",
                    fontWeight: "bold"
                  }}
                >
                  Courier Management System (User)

                </Typography>


                <Button
                  color="inherit"
                  onClick={() => {
                    this.SignOut();
                  }}
                >
                  LogOut
                </Button>
              </Toolbar>
            </AppBar>
          </div>
          <div className="Body">
            <div className="Sub-Body">
              <div className="SubBody11">

                <div
                  className={OrderCourierFlag ? "NavButton1" : "NavButton2"}
                  onClick={() => {
                    this.handleOrderCourierFlag();
                  }}
                >
                  <div className="NavButtonText">Add Courier Details </div>
                </div>

                <div
                  className={MyOrder ? "NavButton1" : "NavButton2"}
                  onClick={() => {
                    this.handleMyOrder();
                  }}
                >
                  <div className="NavButtonText">My Orders</div>
                </div>


              </div>
              <div className="SubBody22">
                <div className="bodyContent" >
                  {OrderCourierFlag &&
                    <>

                      {OrderDetails &&


                        <>
                          {PaymentDetails ?
                            <>
                              <div className="plusContent">
                                <div className="plusContent_sub">
                                  <div className="sportstitlePlus">Add Courier Details</div>
                                  <div>
                                    <form className="form">


                                      <select className="SelectType mb-1" name="CourierType" id="CourierType" value={CourierType} error={CourierTypeFlag} onChange={(e) => this.handleInputChangeCourier(e)}>
                                        <option selected value="">Courier Type</option>
                                        <option value="HOUSEHOLD">Household</option>
                                        <option value="OFFICE">Office</option>
                                        <option value="OTHER">Other</option>

                                      </select>

                                      {CourierType === "OTHER" &&
                                        <select className="SelectType mt-2 mb-1" name="CouierWeight" id="CouierWeight" value={CouierWeight} onChange={(e) => this.handleInputChangeCourier(e)}>
                                          <option selected value="">Courier Weight</option>
                                          <option value="500">0-500 Kg</option>
                                          <option value="1000">500-1000 Kg</option>
                                          <option value="1500">1000-1500 Kg</option>

                                        </select>}

                                      <TextField
                                        type="text"
                                        className="TextField1 mt-2"
                                        name="Source"
                                        label="Source"
                                        variant="outlined"
                                        size="small"
                                        style={{ margin: 20 }}
                                        error={SourceFlag}
                                        value={Source}
                                        onChange={(e) => this.handleInputChangeCourier(e)}
                                      />
                                      <TextField
                                        type="text"
                                        className="TextField1"
                                        name="Destination"
                                        label="Destination"
                                        variant="outlined"
                                        size="small"
                                        style={{ margin: 20 }}
                                        error={DestinationFlag}
                                        value={Destination}
                                        onChange={(e) => this.handleInputChangeCourier(e)}
                                      />
                                      <TextField
                                        type="text"
                                        className="TextField1"
                                        name="Kilometer"
                                        label="Distance"
                                        variant="outlined"
                                        size="small"
                                        style={{ margin: 20 }}
                                        error={KilometerFlag}
                                        value={Kilometer}
                                        onChange={(e) => this.handleInputChangeCourier(e)}
                                      />

                                      <TextField
                                        id="CurrentDate"
                                        className="SelectType textFieldDate"
                                        label="Date"
                                        type="date"
                                        name="CurrentDate"
                                        error={CurrentDateFlag}
                                        value={CurrentDate}
                                        minDate={minDate}
                                        // defaultValue="2017-05-24"
                                        
                                        InputLabelProps={{
                                          shrink: true,
                                        }}
                                        onChange={(e) => this.handleInputChangeCourier(e)}
                                      />

                                      <TextField
                                        className="TextField1"
                                        name="CurrentLocation"
                                        label="Current Location "
                                        variant="outlined"
                                        size="small"
                                        style={{ margin: 20 }}
                                        error={CurrentLocationFlag}
                                        value={CurrentLocation}
                                        onChange={(e) => this.handleInputChangeCourier(e)}
                                      />


                                      <div className="buttons">
                                        <button className="submitbtn1"
                                          onClick={(e) => this.handleProductCuorierSubmit(e)}
                                        >Submit</button>
                                        <button className="cancelbhn">Cancel</button>
                                      </div>

                                    </form>
                                  </div>
                                </div>


                              </div>
                             
                            </> :
                            <>
                              {this.state.BillDetailsData ?
                                <>
                                  <div className="plusContent">
                                    <div className="plusContent_sub">
                                      <div className="sportstitlePlus">Payment Details</div>
                                      <div>
                                        <form className="form">

                                          <TextField
                                            className="TextField1"
                                            name="CourierName"
                                            label="Courier Name"

                                            value={this.state.AmountCalculate}

                                          />
                                          <select className="SelectType mb-1" name="PaymentType" id="PaymentType" value={PaymentType} error={PaymentTypeFlag} onChange={(e) => this.handleInputChangeCourier(e)}>
                                            <option selected value="">Payment Type</option>
                                            <option value="PhonePay">PhonePay</option>
                                            <option value="GPay">GPay</option>
                                          </select>

                                          {(PaymentType === "PhonePay" || PaymentType === "GPay") &&
                                            <TextField
                                              type="text"
                                              className="TextField1 mt-2"
                                              name="PaymentDetailUPI"
                                              label="Payment Details"
                                              variant="outlined"
                                              size="small"
                                              style={{ margin: 20 }}
                                              error={PaymentDetailsFlag}
                                              value={PaymentDetailUPI}
                                              onChange={(e) => this.handleInputChangeCourier(e)}
                                            />}

                                          <div className="buttons">
                                            <button className="submitbtn1"
                                              onClick={(e) => this.handleSubmitDetailsPaymentDetails(e)}
                                            >Submit</button>
                                            <button className="cancelbhn">Cancel</button>
                                          </div>

                                        </form>
                                      </div>
                                    </div>


                                  </div>

                                </> :
                                <>
                                <div className="plusContent">
                                <div className="plusContent_sub">
                                  <div className="sportstitlePlus">Bill Details</div>
                                  <div>
                                    <>
                                          <table className="tableData">
                                            <tr>
                                              <td>Source :</td>
                                              <td>{CourierData.source}</td>

                                            </tr>
                                            <tr>
                                              <td>Destination :</td>
                                              <td>{CourierData.destination}</td>

                                            </tr>
                                            <tr>
                                              <td>Date  :</td>
                                              <td>{CourierData.createdOn}</td>
                                            </tr>
                                            <tr>
                                              <td>Amount :</td>
                                              <td>{CourierData.amount}</td>
                                            </tr>
                                            <tr>
                                              <td>Payment Mode :</td>
                                              <td>{CourierData.paymentMode}</td>
                                            </tr>
                                            
                                          </table>
                                          <button className="m-4" type="button" class="btn btn-secondary " onClick={()=>this.handleCanel()}>Cancel</button>
                                    </>
                                  </div>
                                </div>
                              </div>
                                </>}
                            </>}</>
                      }
                    </>
                  }
                  {TrackCourierFlag &&
                    <>
                      {TrackingIDData ?
                        <>

                          <div className="plusContent">
                            <div className="plusContent_sub">
                              <div className="sportstitlePlus">Tracking Details</div>
                              <div>
                                <form className="form">

                                  <TextField
                                    type="number"
                                    className="TextField1"
                                    name="TrackingID"
                                    label="Tracking ID"
                                    variant="outlined"
                                    size="small"
                                    style={{ margin: 20 }}
                                    error={TrackingIDFlag}
                                    value={TrackingID}
                                    onChange={(e) => this.handleTrackingSubmitInput(e)}
                                  />

                                  <div className="buttons">
                                    <button className="submitbtn1"
                                      onClick={(e) => this.handleTrackingSubmit(e)}
                                    >Submit</button>
                                    <button className="cancelbhn">Cancel</button>
                                  </div>
                                </form>
                              </div>
                            </div>
                          </div>

                        </> :
                        <div className="GetUserMenus-SubContainerAdmin">
                          <TableContainer component={Paper} className="tableStyle">
                            <Table className="tableDeliveryboy" aria-label="simple table">

                              <>
                                <TableHead></TableHead>
                                <TableHead>
                                  <TableRow>
                                    <TableCell
                                      align="Left"
                                      style={{ width: 50, fontWeight: 600, fontSize: 15 }}
                                    >
                                      Id
                                    </TableCell>
                                    <TableCell
                                      align="Left"
                                      style={{ width: 115, fontWeight: 600, fontSize: 15 }}
                                    >
                                      Source
                                    </TableCell>
                                    <TableCell
                                      align="Left"
                                      style={{ width: 115, fontWeight: 600, fontSize: 15 }}
                                    >
                                      Destination
                                    </TableCell>
                                    <TableCell
                                      align="Left"
                                      style={{ width: 100, fontWeight: 600, fontSize: 15 }}
                                    >
                                      Distance
                                    </TableCell>

                                    <TableCell
                                      align="Left"
                                      style={{ width: 100, fontWeight: 600, fontSize: 15 }}
                                    >
                                      CreatedOn
                                    </TableCell>
                                    <TableCell
                                      align="Left"
                                      style={{ width: 100, fontWeight: 600, fontSize: 15 }}
                                    >
                                      Eexpected DeliveryDate
                                    </TableCell>
                                    <TableCell
                                      align="Left"
                                      style={{ width: 100, fontWeight: 600, fontSize: 15 }}
                                    >
                                      Order Type
                                    </TableCell>
                                    <TableCell
                                      align="Left"
                                      style={{ width: 100, fontWeight: 600, fontSize: 15 }}
                                    >
                                      Status
                                    </TableCell>
                                    <TableCell
                                      align="Left"
                                      style={{ width: 100, fontWeight: 600, fontSize: 15 }}
                                    >
                                      Amount
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                              </>

                              <TableBody>

                                <TableRow >
                                  <>
                                    <TableCell align="Left" style={{ width: 200 }}>
                                      {TrackDataArr.id}
                                    </TableCell>
                                    <TableCell align="Left" style={{ width: 200 }}>
                                      {TrackDataArr.source}
                                    </TableCell>
                                    <TableCell align="Left" style={{ width: 100 }}>
                                      {TrackDataArr.destination}
                                    </TableCell>
                                    <TableCell align="Left" style={{ width: 100 }}>
                                      {TrackDataArr.distance}
                                    </TableCell>
                                    <TableCell align="Left" style={{ width: 100 }}>
                                      {moment(TrackDataArr.createdOn).format("DD-MM-YYYY").toString()}

                                    </TableCell>
                                    <TableCell align="Left" style={{ width: 100 }}>
                                      {moment(TrackDataArr.expectedDeliveryDate).format("DD-MM-YYYY").toString()}

                                    </TableCell>
                                    <TableCell align="Left" style={{ width: 100 }}>
                                      {TrackDataArr.orderType}
                                    </TableCell>

                                    <TableCell align="Left" style={{ width: 100 }}>
                                      {TrackDataArr.status}
                                    </TableCell>

                                    <TableCell align="Left" style={{ width: 100 }}>
                                      {TrackDataArr.amount}
                                    </TableCell>
                                  </>

                                  {/* )} */}
                                </TableRow>

                              </TableBody>
                            </Table>
                          </TableContainer>
                        </div>
                      }
                    </>}

                  {MyOrder &&
                    <>

                      <div className="GetUserMenus-SubContainer mt-3">
                        <TableContainer component={Paper} className="tableStyle">
                          <Table className="" aria-label="simple table">
                            {/* {props.State === "UserHome" ? ( */}
                            <>
                              <TableHead></TableHead>
                              <TableHead>
                                <TableRow>
                                  <TableCell
                                    align="center"
                                    style={{ width: 50, fontWeight: 600, fontSize: 15 }}
                                  >
                                    Order ID
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    style={{ width: 200, fontWeight: 600, fontSize: 15 }}
                                  >
                                    Source
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    style={{ width: 100, fontWeight: 600, fontSize: 15 }}
                                  >
                                    Destination
                                  </TableCell>

                                  <TableCell
                                    align="center"
                                    style={{ width: 210, fontWeight: 600, fontSize: 15 }}
                                  >
                                    Distance
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    style={{ width: 210, fontWeight: 600, fontSize: 15 }}
                                  >
                                    Created On
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    style={{ width: 210, fontWeight: 600, fontSize: 15 }}
                                  >
                                    Order Type
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    style={{ width: 210, fontWeight: 600, fontSize: 15 }}
                                  >
                                    Current Location
                                  </TableCell>

                                  <TableCell
                                    align="center"
                                    style={{ width: 210, fontWeight: 600, fontSize: 15 }}
                                  >
                                    Amount
                                  </TableCell>
{/* 
                                  <TableCell
                                    align="center"
                                    style={{ width: 210, fontWeight: 600, fontSize: 15 }}
                                  >
                                    Weight
                                  </TableCell> */}
                                  <TableCell
                                    align="center"
                                    style={{ width: 210, fontWeight: 600, fontSize: 15 }}
                                  >
                                    Status
                                  </TableCell>

                                </TableRow>
                              </TableHead>
                            </>
                            {/* ) : ( */}
                            <></>
                            {/* )} */}
                            <TableBody>
                              {OrderDetailsCourier.length > 0
                                ? OrderDetailsCourier.map((data, index) => {
                                  return (
                                    <TableRow >
                                      {/* {props.State === "UserHome" ? ( */}
                                      <>
                                        <TableCell align="center" style={{ width: 200 }}>
                                          {data.id}

                                        </TableCell>
                                        <TableCell align="center" style={{ width: 200 }}>
                                          {data.source}

                                        </TableCell>
                                        <TableCell align="center" style={{ width: 100 }}>
                                          {data.destination}

                                        </TableCell>
                                        <TableCell align="center" style={{ width: 100 }}>
                                          {data.distance}
                                        </TableCell>
                                        <TableCell align="center" style={{ width: 100 }}>
                                          {data.createdOn}
                                        </TableCell>
                                        <TableCell align="center" style={{ width: 100 }}>
                                          {data.orderType}
                                        </TableCell>
                                        <TableCell align="center" style={{ width: 100 }}>
                                          {data.currentLocation}

                                        </TableCell>
                                        <TableCell align="center" style={{ width: 100 }}>
                                          {data.amount/1000}
                                        </TableCell>
                                        {/* <TableCell align="center" style={{ width: 100 }}>
                                          {data.weight}
                                        </TableCell> */}
                                        <TableCell align="center" style={{ width: 100 }}>
                                          {data.status}
                                        </TableCell>
                                      </>
                                      {/* ) : ( */}
                                      <></>
                                      {/* )} */}
                                    </TableRow>
                                  );
                                })
                                : null}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </div>
                      <Pagination
                        className="Pagination"
                        count={this.state.TotalPages}
                        Page={this.state.PageNumber}
                        onChange={(e) => this.handlePaging(e, this.state.TotalPages)}
                        variant="outlined"
                        shape="rounded"
                        color="secondary"
                      />
                    </>
                  }
                </div>
              </div>
            </div>
          </div>
          <div className="FooterDiv">Footer</div>
        </div>
        <Backdrop
          style={{ zIndex: "1", color: "#fff" }}
          open={this.state.OpenLoader}
          onClick={() => {
            this.setState({ OpenLoader: false });
          }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          open={OpenSnackBar}
          autoHideDuration={2000}
          onClose={this.handleSnackBarClose}
          message={Message}
          action={
            <React.Fragment>
              <Button
                color="secondary"
                size="small"
                onClick={this.handleSnackBarClose}
              >
                UNDO
              </Button>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={this.handleSnackBarClose}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />
      </div>
    );
  }
}