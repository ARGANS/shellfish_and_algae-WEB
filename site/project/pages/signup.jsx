import "@fontsource/montserrat";
import Head from "next/head";
import { useCallback, useState } from "react";
import { sendMessage } from 'libs/GForm/GForm';


function formElementsToJson(elements){
  return Array.from(elements).reduce((collection, input) => {
    if (input.name) {
      collection[input.name] = input.value;
    }
    return collection;
  }, {});
}

const FORM_ENDPOINT = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSdKA6vlDNzOv1iXRrK674pEwEHa0jmn3DRBsNLZb8W6HgW3OQ/formResponse';
const title = "SignUp";

async function signupRequest(formData, emailList) {
  const fields = {
    'entry.546115170': 'Request to register a new user', 
    'entry.861590665': Object.entries(formData)
      .map(([key, value]) => `<b>${key}:</b> ${value}`)
      .join('<br/>'),
    'entry.1470631581': emailList
  };

  return sendMessage(FORM_ENDPOINT, fields);
}

const FormStatus ={
  idle: 1,
  success:2,
  fail: 3
}

function SignupPage(props) {
  const [formState, setFormState] = useState(FormStatus.idle);
  const onSubmit = useCallback(function(event) {
    const target= event.target;
    
    event.preventDefault();
    signupRequest(formElementsToJson(target.elements), props.emailList)
      .then(() => {
        setFormState(FormStatus.success);
        target.reset();
      })
      .catch(e => {
        console.log('Error')
        console.dir(e);
        setFormState(FormStatus.fail);
      })
  }, [])


  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property="og:title" content={title} key="title" />
        <link rel="stylesheet" type="text/css" href="/assets/main.css" />
			  <link rel="stylesheet" type="text/css" href="/assets/index.css" />
      </Head>
      <main>
        <div className="bcontainer">
          <div className="">
            <div className="">
              <h1 className="title">Signup with your email</h1>
              {formState === FormStatus.success && (<div className="mb-2 mt-2 notification is-success">
                <h2 className="main-title__main">Thank you!</h2>
                <p>You will be notified by email</p>  
              </div>)}
              {formState === FormStatus.fail && (<div className="mb-2 mt-2 notification is-warning">
                <h2 className="main-title__secondary">OOPS!</h2>
                <p>There is a problem, we are fixing it</p>  
              </div>)}
              <form 
                onSubmit={onSubmit} 
                className="regular-grid"
                style={{"--description-grid__gap": "1rem 1rem"}}
              >
                <label>First name:</label>
                <input className="" type="text" name="FirstName" required/>

                <label>Last name:</label>
                <input className="" type="text" name="LastName" required/>

                <label>Email:</label>
                <input className="" type="text" name="Email" required/>

                <label>Company:</label>
                <input className="" type="text" name="Company" required/>

                <label>Country:</label>
                <input className="" type="text" name="Country" required/>

                <label>Username:</label>
                <input className="" type="text" name="Username" required/>

                <button type="submit" className="btn btn-primary">Request</button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default SignupPage;

export async function getStaticProps(context) {
  return {
    props: {
      emailList: process.env?.NEXT_PUBLIC_SIGNUP_FORM_RECIPIENTS || "nmaltsev@argans.eu,quentin.jutard@acri-st.fr,pbryere@argans.eu",
    },
  };
}
