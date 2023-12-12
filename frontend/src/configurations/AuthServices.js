import AxiosServices from "./AxiosServices";
let baseURL = "http://localhost:9090/"
const axiosServices = new AxiosServices();

const headers = {
  headers: {
    "accept": "*/*",
    "Content-Type": "application/json",
    // "cache-control": "no-cache",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
};

// const UserId = localStorage.getItem('UserId')
// 
export default class AuthServices {
  SignUp(data) { 
    return axiosServices.post(baseURL + "api/auth/register", data, false);
  }

  SignIn(data) {
    return axiosServices.post(baseURL + "api/auth/login", data, false);
  }

  CreateCourierService(data) {
    return axiosServices.post(baseURL +`user/courier/create`, data, true, headers);
  }
  
  TRackCourierDetails(id) {
    return axiosServices.Get(baseURL +`user/courier/trackById/${id}`, true, headers);
  }

  CustomerOrderCourier() {
    return axiosServices.Get(baseURL + `user/courier/myOrders`, true, headers);
  }

  AgentRegister(data) {
    return axiosServices.post(baseURL  + `admin/agent/register`, data, true, headers);
  }

  AllAgentList(data) {
    return axiosServices.Get(baseURL + `admin/agent/getAll`,true,headers);
  }

  GetCourierDataAdmin() {
    return axiosServices.Get(baseURL  + `admin/courier/getAll`,true,headers);
  }

  GetALLCustomerDataAdmin(data) {
    return axiosServices.Get(baseURL + `admin/users/getAll`,true,headers);
  }

  DeleteCourierId(id) {
    return axiosServices.Delete(baseURL+ `admin/courier/delete/${id}`,true,headers);
  }
  
  CalculatedAmountForWeight(data) {
    return axiosServices.post(baseURL + `user/rates/calculate`, data, true, headers);
  }

  DeleteCourierIdAgent(id) {
    return axiosServices.Delete(baseURL+ `admin/agent/delete/${id}`,true,headers);
  }

  UpdateAgentDataByADmin(AgentId,data) {
    
    return axiosServices.put(baseURL + `admin/agent/update/profile/${AgentId}`,data,true,headers);
  }

  AssignAgent(AID,CID) {
    return axiosServices.Get(baseURL + `admin/courier/assignAgent/${AID}/${CID}`,true,headers);
  }


}
