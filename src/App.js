import React from "react";
import './App.css';
import Clarifai from 'clarifai';
import Navigation from "./components/Navigation/Navigation.js";
import Signin from "./components/Signin/Signin.js";
import Register from "./components/Register/Register.js";
import Logo from "./components/Logo/Logo.js";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm.js"
import Rank from "./components/Rank/Rank";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
// import Particles from 'react-particles-js';
// import Particles from "react-tsparticles";


const app = new Clarifai.App({
 apiKey: '21de48df5b0a43d9934355cad7684e0d'
});

class App extends React.Component {
  constructor(){
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: "signin",
      isSignedIn:false,
      user:{
        id: "",
        name: "",
        email: "",
        entries: 0,
        joined: ""

      }
    }
  }

loadUser=(data)=>{
  this.state({user:{
          id: data.id,
          name: data.name,
          email:data.email,
          entries: data.entries,
          joined: data.joined
  }
  })
}

// componentDidMount(){
//       fetch("http://localhost:3000")
//       .then(response=>response.json())
//       .then(console.log)
// }

  calculateFaceLocation =(data)=> {
      const clarifaiFace= data.response.output[0].data.regions[0].region_info.bounding_box;
      const image = document.getElementById("inputimage");
      const width = Number(image.width);
      const height = Number(image.height);
      return {
          leftCol: clarifaiFace.left_col * width,
          topRow: clarifaiFace.top_row * height,
          rightCol: width - (clarifaiFace.right_col * width),
          bottonRow: height - (clarifaiFace.bottom_row * height)
      }
  }

  displayFaceBox = (box)=>{
      this.setState({box:box})
  }


  OnButtonSubmit = () => 
  {
    this.setState({imageUrl: this.state.input});
    app.models
              .predict(
        Clarifai.FACE_DETECT_MODEL,
        this.state.input)
        .then(response=>{
                      if(response){
                      fetch("http://localhost:3000/image",{
                        method:"put",
                        headers:{"Content-Type":"application/json"},
                        body:JSON.stringify({
                          id:this.state.user.id
                                            })

                                                          }
                            )
                      .then(response=>response.json())
                      .then(count=>{
                          this.setState({user:{
                            entries:count
                          }})
                      })
                      
                      }
                      }
                      )
              // this.displayFaceBox(this.calculateFaceLocation(response)) 
                  
               .catch(err=>console.log(err))       
  }

  onRouteChange =(route)=>{
      if(route ==="signout"){
        this.setState({isSignedIn:false})
      } else if(route ==="home"){
        this.setState({isSignedIn:true})
      }
      this.setState({route:route})
  }

  OnInputChange = (event) => {
        this.setState({input: event.target.value});
    // console.log(event.target.value);
  }
  render() {
  return (
    <div className="App">
        {/*Particles*/}
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/> 
        { this.state.route ==="home"
          ? <div>
                <Logo/>
                <Rank name={this.state.user.name} entries={this.state.user.entries} />
                <ImageLinkForm OnInputChange={this.OnInputChange} 
                              OnButtonSubmit={this.OnButtonSubmit} />
                <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl} />
            </div>
          :(
            this.state.route==="signin"
            ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            ) 
        }
    </div>
  );
}}

export default App;
