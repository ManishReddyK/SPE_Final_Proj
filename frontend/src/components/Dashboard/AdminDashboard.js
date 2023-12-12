import React, { Component } from "react";
import "./AdminDashboard.css";
// import GetMenuItem from "../Product/GetMenuItem";
// import GetUserMenus from "../Product/GetUserMenus";
import AuthServices from "../../configurations/AuthServices";
import TextField from "@material-ui/core/TextField";
import ControlPointIcon from '@material-ui/icons/ControlPoint';
import moment from 'moment';
// import DeleteIcon from '@material-ui/icons/Delete';
// import CreateIcon from '@material-ui/icons/Create';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
// import Box from '@material-ui/core/Box';
// import CustomerServices from "../../services/CustomerServices";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import Backdrop from "@material-ui/core/Backdrop";
import Pagination from "@material-ui/lab/Pagination";

import CircularProgress from "@material-ui/core/CircularProgress";
import Snackbar from "@material-ui/core/Snackbar";
import CloseIcon from "@material-ui/icons/Close";
//Table Library
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import TableCell from "@material-ui/core/TableCell";


const authServices = new AuthServices();
function rand() {
  return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const styles = theme => ({
  paper: {
    position: 'absolute',
    width: theme.spacing.MobileNoAgent * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.MobileNoAgent * 4,
    outline: 'none',
  },
});

// const productServices = new ProductServices();
// const customerServices = new CustomerServices();

class AdminDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      
      AgentDetailsHome: true,
    
      CustomerListManagement: false,
      CourierListAdmin: false,
      tableDatCustomerListManagement:true,
      tableDataCourierListAdmin:true,
  
      AgentData: [],
      CustomerListData: [],
      Message: "",
      //
      NumberOfRecordPerPage: 6,
      PageNumber: 0,
      TotalPages: 0,
      TotalRecords: 0,
      OpenLoader: false,
      OpenSnackBar: false,    
      AgentDetailList: true,
      //Courior Management System
      CourierData: [],
      FirstNameAgent: "",
      FirstNameAgentFlag: false,
      LastNameAgent: "",
      LastNameAgentFlag: false,
      EmailAgent: "",
      EmailAgentFlag: false,
      MobileNoAgent: "",
      MobileNoAgentFlag: false,
      DateCourior: "",
      DateCouriorFlag: false,
      PasswordAgent: "",
      PasswordAgentFlag: false,
      Price: "",
      PriceFlag: false,
      CustomerDetails: [],
      btnassign: true,
      AssignAgentAdmin: false,
      CourierOrderID: 0,
      AgentAssignID: 0,
      EditAgentId:0,
      UpdateBtn:true,
    };
  }

  componentWillMount() {
    this.AllAgentList();
  }

  handleSnackBarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    this.setState({ OpenSnackBar: false });
  };

  handlePaging = async (e, value) => {
    debugger
    let state = this.state;
    console.log("Current Page : ", value);
    this.setState({
      PageNumber: value,
    });

    // if (this.state.OpenHome) {
    //   await this.GetAllOrderDetails(value);
    // }
    if (this.state.OpenHome) {
      // await this.GetAllOrderDetails(value);
    }
    if (this.state.FeedBackDetails) {
      await this.handleFeedBackAdmin(value)
    }
    if (this.state.CustomerListManagement) {
      await this.handleCustomerListData(value)
    }
    if (this.state.CourierListAdmin) {
      await this.GetCourierDataAdmin(value)
    }
  };

  SignOut = async () => {
    await localStorage.removeItem("token");
    this.props.history.push("/SignIn");
  };

  handleClose = () => {
    this.setState({
      openModel: false
    })
  };

  getModalStyle = () => {
    const top = 50 + rand();
    const left = 50 + rand();
    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }

  ///////////////////////////////////// Courier Management System //////////////////////////////////
  componentDidMount=()=>{
    this.AllAgentList(); // list of all agents
  }

  handleHomeNav = () => {
    this.setState({
      PageNumber: 0,
      AssignAgentAdmin: false,
      AgentDetailsHome: true,
      CustomerListManagement: false,
      CourierListAdmin: false,
    });

    // this.GetAllOrderDetails(this.state.PageNumber);
  };

  handleCustomerList = () => {
    this.setState({
      AgentDetailsHome: false,
      AssignAgentAdmin: false,
      CustomerListManagement: true,
      CourierListAdmin: false,
    });
    this.GetALLCustomerDataAdmin()
  }

  HandleCourierListAdmin = () => {
    this.setState({
      AgentDetailsHome: false,
      CustomerListManagement: false,
      CourierListAdmin: true,
      AssignAgentAdmin: false,
    });
    this.GetCourierDataAdmin(this.state.PageNumber)
  }

  HandleAssignAgentAdmin = () => {
    this.setState({
      AssignAgentAdmin: true,
      AgentDetailsHome: false,
      CustomerListManagement: false,
      CourierListAdmin: false,
    });
    this.GetCourierDataAdmin(
      this.AllAgentList()
    )

  }
  handleEditAdmin=(id,firstName,lastName,email,mobileNo)=>{
  this.setState({
    AgentDetailList:false,
    EditAgentId:id,
    FirstNameAgent:firstName,
    LastNameAgent:lastName,
    EmailAgent:email,
    MobileNoAgent:mobileNo,
    UpdateBtn:false
  })
  }
  handledeleteAdmin = (id) => {
    authServices

      .DeleteCourierId(id)
      .then((data) => {
        console.log("filedata : ", data);
        debugger
        if (data !== null) {

          this.setState({
            OpenLoader: false,
            OpenSnackBar: true,
            Message: data.data.message
          });
          this.GetCourierDataAdmin()
        }
      })
      .catch((error) => {
        console.log("GetUserAppointments Error : ", error);
        this.setState({ OpenLoader: false });
      });
  }
  GetCourierDataAdmin = async () => {
    authServices
      .GetCourierDataAdmin()
      .then((data) => {
        console.log("AddressData Data : ", data);
        // debugger
        if (data.data.data !== null) {

          this.setState({
            CourierData: data.data.data,

            OpenLoader: false,
          });
        }
      })
      .catch((error) => {
        console.log("GetUserAppointments Error : ", error);
        this.setState({ OpenLoader: false });
      });
  };
  AllAgentList = async (CurrentPage) => {

    authServices
      .AllAgentList()
      .then((data) => {
        console.log("GetUserAppointments Data : ", data);
        // debugger
        if (data.data.data !== null) {

          this.setState({
            AgentData: data.data.data,
            TotalPages: data.data.data.totalPages,
            PageNumber: data.data.data.number,
            OpenLoader: false,
          });
        }
      })
      .catch((error) => {
        console.log("GetUserAppointments Error : ", error);
        this.setState({ OpenLoader: false });
      });
  };

  handlePluseIcon = () => {
    this.setState({
      AgentDetailList: !this.state.AgentDetailList
    })
  }

  handleInputChangeAgentData = (e) => {
    let val = e.target.value
    if (e.target.name === "FirstNameAgent") {
      this.setState({
        FirstNameAgent: e.target.value,
        FirstNameAgentFlag: false
      })
    }
    if (e.target.name === "LastNameAgent") {
      this.setState({
        LastNameAgent: e.target.value,
        LastNameAgentFlag: false
      })
    }
    if (e.target.name === "MobileNoAgent") {
      this.setState({
        MobileNoAgent: e.target.value,
        MobileNoAgentFlag: false
      })
    }
    if (e.target.name === "PasswordAgent") {
      this.setState({
        PasswordAgent: e.target.value,
        PasswordAgentFlag: false
      })
    }
    if (e.target.name === "DateCourior") {
      this.setState({
        DateCourior: e.target.value,
        DateCouriorFlag: false
      })
    }
    if (e.target.name === "EmailAgent") {
      this.setState({
        EmailAgent: e.target.value,
        EmailAgentFlag: false
      })
    }
    this.setState({
      [e.target.name]: e.target.value
    })
  }


  handleValidationTestAgent = () => {
    const { FirstNameAgent, LastNameAgent, MobileNoAgent, EmailAgent, PasswordAgent } = this.state
    let isValid = true
    if (FirstNameAgent === "") {
      this.setState({
        FirstNameAgentFlag: true
      })
      isValid = false
    }
    if (LastNameAgent === "") {
      this.setState({
        LastNameAgentFlag: true
      })
      isValid = false
    }
    if (MobileNoAgent === "") {
      this.setState({
        MobileNoAgentFlag: true
      })
      isValid = false
    }
    if (EmailAgent === "") {
      this.setState({
        EmailAgentFlag: true
      })
      isValid = false
    }
    if (PasswordAgent === "") {
      this.setState({
        PasswordAgentFlag: true
      })
      isValid = false
    }
    return isValid;
  }
  handleAgentSubmit = () => {
    let isvalid = this.handleValidationTestAgent()
    if (isvalid) {
      let res = {
        "firstName": this.state.FirstNameAgent?.toString(),
        "lastName": this.state.LastNameAgent?.toString(),
        "email": this.state.EmailAgent?.toString(),
        "mobileNo": this.state.MobileNoAgent?.toString(),
        "password": this.state.PasswordAgent?.toString(),
        "confirmPassword": this.state.PasswordAgent?.toString(),
        "role": "AGENT"
      }
      authServices
        .AgentRegister(res)
        .then((data) => {
          console.log("filedata : ", data);
          if (data.data.data !== null) {
            this.setState({
              AgentDetailList: true,
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

  handledeleteAdminAgent =(id)=>{
    authServices
      .DeleteCourierIdAgent(id)
      .then((data) => {
        console.log("filedata : ", data);
        debugger
        if (data !== null) {
          this.setState({
            OpenLoader: false,
            OpenSnackBar: true,
            Message: data.data.message
          });
          this.AllAgentList()
        }
      })
      .catch((error) => {
        console.log("GetUserAppointments Error : ", error);
        this.setState({ OpenLoader: false });
      });
  }
  handleAgentEditSubmit=(e)=>{
    e.preventDefault()
    
    let isvalid = this.handleValidationTestAgent()
    if (isvalid) {
      let res = {
        "firstName": this.state.FirstNameAgent?.toString(),
        "lastName": this.state.LastNameAgent?.toString(),
        "email": this.state.EmailAgent?.toString(),
        "mobileNo": this.state.MobileNoAgent?.toString(),
        "password": this.state.PasswordAgent?.toString(),
        "confirmPassword": this.state.PasswordAgent?.toString(),
        "role": "AGENT"
      }
      authServices
        .UpdateAgentDataByADmin(this.state.EditAgentId,res)
        .then((data) => {
          console.log("filedata : ", data);
          if (data.data.data !== null) {
            this.setState({
              AgentDetailList: true,
              OpenLoader: false,
              OpenSnackBar: true,
              Message: data.data.message
            });
            this.AllAgentList()
          }
        })
        .catch((error) => {
          console.log("GetUserAppointments Error : ", error);
          this.setState({ OpenLoader: false });
        });

    }
  }
  GetALLCustomerDataAdmin = async (CurrentPage) => {

    authServices
      .GetALLCustomerDataAdmin()
      .then((data) => {
        console.log("GetUserAppointments Data : ", data);
        // debugger
        if (data.data.data !== null) {
          this.setState({
            CustomerDetails: data.data.data,
            TotalPages: data.data.data.totalPages,
            PageNumber: data.data.data.number,
            OpenLoader: false,
          });
        }
      })
      .catch((error) => {
        console.log("GetUserAppointments Error : ", error);
        this.setState({ OpenLoader: false });
      });
  };

  handleInputChangeCourier = (e) => {
    if (e.target.name === "CourierOrderID") {
      this.setState({
        CourierOrderID: e.target.value
      })
      document.getElementById("CourierOrderID").classList.remove("validation")
    }
    if (e.target.name === "AgentAssignID") {
      this.setState({
        AgentAssignID: e.target.value
      })
      document.getElementById("AgentAssignID").classList.remove("validation")
    }
  }

  checkAssignAgaentValidation = () => {
    let isvalid = true;
    if (this.state.CourierOrderID === "") {
      isvalid=false

      document.getElementById("CourierOrderID").classList.add("validation")
    }
    if (this.state.AgentAssignID === "") {
      isvalid=false
      document.getElementById("AgentAssignID").classList.add("validation")
    }
    return isvalid;
  }
  handleAgentCuorierSubmit = (e) => {
    debugger  
    e.preventDefault()
    let valid = this.checkAssignAgaentValidation()
    if (valid) {
    
      authServices
      .AssignAgent(this.state.AgentAssignID,this.state.CourierOrderID)
      .then((data) => {
        console.log("GetUserAppointments Data : ", data);
        // debugger
        if (data.data !== null) {

          this.setState({
            OpenLoader: false,
            AgentAssignID:"",
            CourierOrderID:"",
            OpenSnackBar: true,
            Message: data.data.message,
            TotalPages: data.data.data.totalPages,
            PageNumber: data.data.data.number,
            OpenLoader: false,
          });
        }
      })
      .catch((error) => {
        console.log("GetUserAppointments Error : ", error);
        this.setState({ OpenLoader: false });
      });
    }
  }


  render(){

    let state = this.state;
    let self = this;

    const {UpdateBtn, FirstNameAgent, FirstNameAgentFlag, LastNameAgent, LastNameAgentFlag, AgentDetailsHome, EmailAgent, EmailAgentFlag, MobileNoAgent, MobileNoAgentFlag, CourierOrderID, AgentAssignID, PasswordAgent, PasswordAgentFlag, CourierData, AgentDetailList, AgentData,CustomerDetails, tableDatCustomerListManagement, FeedBackDetails, CustomerListManagement, CourierListAdmin, tableDataCourierListAdmin, AssignAgentAdmin} = this.state
    console.log("state : ", state);
    const { classes } = this.props;
    return (

      <div className="AdminDashboard-Container">

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
                  }}
                >
                  Courier Management System (Admin)

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
                  className={AgentDetailsHome ? "NavButton1" : "NavButton2"}
                  onClick={() => {
                    this.handleHomeNav();
                  }}
                >

                  <div className="NavButtonText">Agent Details</div>
                </div>

                <div
                  className={CustomerListManagement ? "NavButton1" : "NavButton2"}
                  onClick={() => {
                    this.handleCustomerList();
                  }}
                >

                  <div className="NavButtonText">Customer List</div>
                </div>
                <div
                  className={CourierListAdmin ? "NavButton1" : "NavButton2"}
                  onClick={() => {
                    this.HandleCourierListAdmin();
                  }}
                >

                  <div className="NavButtonText">Courier List</div>
                </div>
                <div
                  className={AssignAgentAdmin ? "NavButton1" : "NavButton2"}
                  onClick={() => {
                    this.HandleAssignAgentAdmin();
                  }}
                >

                  <div className="NavButtonText">Assign Agent</div>
                </div>


              </div>
              <div className="SubBody21">
                <div className="bodyContent">
                  {AgentDetailsHome &&
                    <>


                      {AgentDetailList ?
                        <>
                          <div className="sportstitle1 mb-4">New Agent  <ControlPointIcon className="iconbtn" onClick={() => this.handlePluseIcon()} /> </div>
                          <div className="GetUserMenus-SubContainerAdmin ">
                            <TableContainer component={Paper} className="tableStyle">
                              <Table className="" aria-label="simple table">
                                {/* {props.State === "UserHome" ? ( */}
                                <>
                                  <TableHead></TableHead>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell
                                        align="center"
                                        style={{ width: 50, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Agent ID
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        style={{ width: 50, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        First Name
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        style={{ width: 200, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Last Name
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        style={{ width: 200, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Email Id
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        style={{ width: 100, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Mobile Number
                                      </TableCell>

                                      <TableCell
                                        align="center"
                                        style={{ width: 210, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Role
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        style={{ width: 210, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Created On
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        style={{ width: 210, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Action
                                      </TableCell>


                                    </TableRow>
                                  </TableHead>
                                </>
                                {/* ) : ( */}
                                <></>
                                {/* )} */}
                                <TableBody>
                                  {AgentData.length > 0
                                    ? AgentData.map((data, index) => {
                                      return (
                                        <TableRow >
                                          {/* {props.State === "UserHome" ? ( */}
                                          <>
                                            <TableCell align="center" style={{ width: 200 }}>
                                              {data.id}

                                            </TableCell>
                                            <TableCell align="center" style={{ width: 200 }}>
                                              {data.firstName}

                                            </TableCell>
                                            <TableCell align="center" style={{ width: 100 }}>
                                              {data.lastName}

                                            </TableCell>
                                            <TableCell align="center" style={{ width: 100 }}>
                                              {data.email}
                                            </TableCell>
                                            <TableCell align="center" style={{ width: 100 }}>
                                              {data.mobileNo}
                                            </TableCell>
                                            <TableCell align="center" style={{ width: 100 }}>
                                              {data.role}
                                            </TableCell>
                                            <TableCell align="center" style={{ width: 100 }}>

                                              {moment(data.createdOn).format("DD-MM-YYYY").toString()}

                                            </TableCell>

                                            <TableCell align="center" style={{ width: 100 }}>
                                              <EditIcon onClick={() => this.handleEditAdmin(data.id,data.firstName,data.lastName,data.email,data.mobileNo)} />;
                                              <DeleteIcon style={{ cursor: "pointer" }} onClick={() => this.handledeleteAdminAgent(data.id)} />

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


                        </>
                        :
                        <>
                          <div className="plusContent">
                            <div className="plusContent_sub">
                              {UpdateBtn ?
                              <div className="sportstitlePlus">Create New Agent </div>:
                              <div className="sportstitlePlus">Edit Agent </div>}
                              <div>
                                <form className="form">

                                  <TextField
                                    className="TextField1"
                                    name="FirstNameAgent"
                                    label="First Name"
                                    variant="outlined"
                                    size="small"
                                    style={{ margin: 20 }}
                                    error={FirstNameAgentFlag}
                                    value={FirstNameAgent}
                                    onChange={(e) => this.handleInputChangeAgentData(e)}
                                  />
                                  <TextField
                                    type="text"
                                    className="TextField1"
                                    name="LastNameAgent"
                                    label="Last Name"
                                    variant="outlined"
                                    size="small"
                                    style={{ margin: 20 }}
                                    error={LastNameAgentFlag}
                                    value={LastNameAgent}
                                    onChange={(e) => this.handleInputChangeAgentData(e)}
                                  />
                                  <TextField
                                    type="text"
                                    className="TextField1"
                                    name="EmailAgent"
                                    label="Email ID"
                                    variant="outlined"
                                    size="small"
                                    style={{ margin: 20 }}
                                    error={EmailAgentFlag}
                                    value={EmailAgent}
                                    onChange={(e) => this.handleInputChangeAgentData(e)}
                                  />
                                  <TextField
                                    type="text"
                                    className="TextField1"
                                    name="MobileNoAgent"
                                    label="Mobile Number"
                                    variant="outlined"
                                    size="small"
                                    style={{ margin: 20 }}
                                    error={MobileNoAgentFlag}
                                    value={MobileNoAgent}
                                    onChange={(e) => this.handleInputChangeAgentData(e)}
                                  />
                                  <TextField
                                    type="text"
                                    className="TextField1"
                                    name="PasswordAgent"
                                    label="Password"
                                    variant="outlined"
                                    size="small"
                                    style={{ margin: 20 }}
                                    error={PasswordAgentFlag}
                                    value={PasswordAgent}
                                    onChange={(e) => this.handleInputChangeAgentData(e)}
                                  />
                                  <div className="buttons">
                                    {UpdateBtn ?
                                    <button className="submitbtn1"
                                      onClick={(e) => this.handleAgentSubmit(e)}
                                    >Submit</button>:
                                      <button className="submitbtn1"
                                      onClick={(e) => this.handleAgentEditSubmit(e)}
                                    >Update</button>}
                                    <button className="cancelbhn">Cancel</button>
                                  </div>

                                </form>
                              </div>
                            </div>


                          </div>
                        </>
                      }
                    </>
                  }


                  {CustomerListManagement &&
                    <>
                      {tableDatCustomerListManagement &&
                        // <div>
                        <>
                          {/* <div className="deliveryboybtn mb-4"> Active Customers <ControlPointIcon onClick={() => this.handlePluseIconCustomerList(this.state.PageNumber)} /> </div> */}
                          <div className="GetUserMenus-SubContainerAdmin">
                            <TableContainer component={Paper} className="tableStyle">
                              <Table className="tableDeliveryboy" aria-label="simple table">

                                <>
                                  <TableHead></TableHead>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell
                                        align="Left"
                                        style={{ width: 50, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Id
                                      </TableCell>
                                      <TableCell
                                        align="Left"
                                        style={{ width: 100, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        First Name
                                      </TableCell>
                                      <TableCell
                                        align="Left"
                                        style={{ width: 150, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Last Name
                                      </TableCell>
                                      <TableCell
                                        align="Left"
                                        style={{ width: 193, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Email ID
                                      </TableCell>
                                      <TableCell
                                        align="Left"
                                        style={{ width: 193, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Mobile Number
                                      </TableCell>
                                      <TableCell
                                        align="Left"
                                        style={{ width: 100, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Created On
                                      </TableCell>

                                      <TableCell
                                        align="Left"
                                        style={{ width: 100, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Role
                                      </TableCell>


                                    </TableRow>
                                  </TableHead>
                                </>

                                <TableBody>
                                  {CustomerDetails.length > 0
                                    ? CustomerDetails.map((data, index) => {
                                      return (
                                        <TableRow >

                                          <>
                                            <TableCell align="Left" style={{ width: 200 }}>
                                              {data.id}
                                            </TableCell>
                                            <TableCell align="Left" style={{ width: 200 }}>
                                              {data.firstName}
                                            </TableCell>
                                            <TableCell align="Left" style={{ width: 100 }}>
                                              {data.lastName}
                                            </TableCell>
                                            <TableCell align="Left" style={{ width: 100 }}>
                                              {data.email}
                                            </TableCell>
                                            <TableCell align="Left" style={{ width: 100 }}>
                                              {data.mobileNo}
                                            </TableCell>
                                            <TableCell align="Left" style={{ width: 100 }}>
                                              {moment(data.createdOn).format("DD-MM-YYYY").toString()}

                                            </TableCell>

                                            <TableCell align="Left" style={{ width: 100 }}>
                                              {data.role}
                                            </TableCell>
                                            {/* <TableCell align="center" style={{ width: 100 }}>
                                              <DeleteIcon style={{ cursor: "pointer" }} onClick={() => this.handledeleteAdmin(data.id)} />

                                            </TableCell> */}

                                          </>

                                          {/* )} */}
                                        </TableRow>
                                      );
                                    })
                                    : null}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </div>
                        </>
                        // </div>
                      }

                    </>}

                  {CourierListAdmin &&
                    <>

                      {tableDataCourierListAdmin &&
                        <>

                          <div className="GetUserMenus-SubContainerAdmin">
                            <TableContainer component={Paper} className="tableStyle">
                              <Table className="" aria-label="simple table">
                                {/* {props.State === "UserHome" ? ( */}
                                <>
                                  <TableHead></TableHead>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell
                                        align="center"
                                        style={{ width: 50, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Courier ID
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        style={{ width: 200, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Source
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        style={{ width: 100, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Destination
                                      </TableCell>

                                      <TableCell
                                        align="center"
                                        style={{ width: 210, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Distance
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        style={{ width: 210, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Current Location
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        style={{ width: 210, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Courier Type
                                      </TableCell>
                                      {/* <TableCell
                                        align="center"
                                        style={{ width: 210, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Weight
                                      </TableCell> */}
                                      <TableCell
                                        align="center"
                                        style={{ width: 210, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Status
                                      </TableCell>

                                      <TableCell
                                        align="center"
                                        style={{ width: 210, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Created On
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        style={{ width: 210, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Expected Delivery
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        style={{ width: 210, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Payment Mode
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        style={{ width: 210, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Amount
                                      </TableCell>

                                      <TableCell
                                        align="center"
                                        style={{ width: 210, fontEmailAgent: 600, fontSize: 15 }}
                                      >
                                        Action
                                      </TableCell>


                                    </TableRow>
                                  </TableHead>
                                </>
                                {/* ) : ( */}
                                <></>
                                {/* )} */}
                                <TableBody>
                                  {CourierData.length > 0
                                    ? CourierData.map((data, index) => {
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
                                              {data.currentLocation}
                                            </TableCell>
                                            <TableCell align="center" style={{ width: 100 }}>
                                              {data.orderType}
                                            </TableCell>
                                            {/* <TableCell align="center" style={{ width: 100 }}>
                                              {data.weight}

                                            </TableCell> */}
                                            <TableCell align="center" style={{ width: 100 }}>
                                              {data.status}

                                            </TableCell>
                                            <TableCell align="center" style={{ width: 100 }}>
                                              {data.createdOn}

                                            </TableCell>
                                            <TableCell align="center" style={{ width: 100 }}>
                                              {data.expectedDeliveryDate}
                                            </TableCell>
                                            <TableCell align="center" style={{ width: 100 }}>
                                              {data.paymentMode}
                                            </TableCell>
                                            <TableCell align="center" style={{ width: 100 }}>
                                              {data.amount}
                                            </TableCell>


                                            <TableCell align="center" style={{ width: 100 }}>

                                              <DeleteIcon style={{ cursor: "pointer" }} onClick={() => this.handledeleteAdmin(data.id)} />

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
                        </>}
                    </>
                  }

                  {AssignAgentAdmin &&
                    <>
                      <div className="plusContent">
                        <div className="plusContent_sub">
                          <div className="sportstitlePlus">Add Courier Details</div>
                          <div>
                            <form className="form">


                              <select className="SelectType mb-1" name="CourierOrderID" id="CourierOrderID" value={CourierOrderID} onChange={(e) => this.handleInputChangeCourier(e)}>

                                <option selected value="">Courier Order Id</option>
                                {
                                  CourierData.map((data, index) => {
                                    return (
                                      <option value={data.id}>{data.id}</option>)
                                  })}


                              </select>
                              <select className="SelectType mt-2 mb-1" name="AgentAssignID" id="AgentAssignID" value={AgentAssignID} onChange={(e) => this.handleInputChangeCourier(e)}>
                                <option selected value="">Agent ID</option>
                                {AgentData.map((data, index) => {
                                  return (
                                    <option value={data.id}>{data.id}</option>)
                                })}


                              </select>


                              <div className="buttons">
                                <button className="submitbtn1"
                                  onClick={(e) => this.handleAgentCuorierSubmit(e)}
                                >Submit</button>
                                <button className="cancelbhn">Cancel</button>
                              </div>

                            </form>
                          </div>
                        </div>


                      </div>
                    </>}

                  {(AgentDetailsHome || FeedBackDetails || CustomerListManagement || CourierListAdmin) &&
                    <Pagination
                      className="Pagination"
                      count={this.state.TotalPages}
                      Page={this.state.PageNumber}
                      onChange={(e) => this.handlePaging(e, this.state.TotalPages)}
                      variant="outlined"
                      shape="rounded"
                      color="secondary"
                    />}
                </div>
              </div>


            </div>
            <div className="FooterDiv">Footer</div>
          </div>
        </div>


        <Backdrop
          style={{ zIndex: "1", color: "#fff" }}
          open={this.state.OpenLoader}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          open={state.OpenSnackBar}
          autoHideDuration={2000}
          onClose={this.handleSnackBarClose}
          message={state.Message}
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

AdminDashboard.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(AdminDashboard);