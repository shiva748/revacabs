import React from "react";
import "./css/term.css";
import { Helmet } from "react-helmet";

const Pripol = () => {
  return (
    <>
    <Helmet>
    <meta http-equiv="Content-Security-Policy" content="script-src https://checkout.razorpay.com/v1/checkout.js 'self';"/>
        <meta charSet="utf-8" />
        <title>Privacy Policy - Revacabs</title>
        <meta
          name="description"
          content="These are the following Privacy Policy that any individual should consider before Before submitting any details to us"
        />
         <meta name="keywords" content={"Reva Cabs, Reva Privacy Policy, Privacy Policy"}/>
        <link rel="canonical" href="http://revacabs.com/" />
      </Helmet>
    <section className="term_sec">
      <div>
        <h5>Privacy Policy for Reva Cabs</h5>

        <p>
          At Reva Cabs, accessible from http://www.revacabs.com/, one of our
          main priorities is the privacy of our visitors. This Privacy Policy
          document contains types of information that is collected and recorded
          by Reva Cabs and how we use it.
        </p>

        <p>
          If you have additional questions or require more information about our
          Privacy Policy, do not hesitate to contact us.
        </p>

        <p>
          This Privacy Policy applies only to our online activities and is valid
          for visitors to our webapp with regards to the information that they
          shared and/or collect in Reva Cabs. This policy is not applicable to
          any information collected offline or via channels other than this
          webapp.
        </p>

        <h5>Consent</h5>

        <p>
          By using our webapp, you hereby consent to our Privacy Policy and
          agree to its terms.
        </p>

        <h5>Information we collect</h5>

        <p>
          The personal information that you are asked to provide, and the
          reasons why you are asked to provide it, will be made clear to you at
          the point we ask you to provide your personal information.
        </p>
        <p>
          If you contact us directly, we may receive additional information
          about you such as your name, email address, phone number, the contents
          of the message and/or attachments you may send us, and any other
          information you may choose to provide.
        </p>
        <p>
          When you register for an Account, we may ask for your contact
          information, including items such as name, company name, address,
          email address, telephone number and GST number.
        </p>

        <h5>How we use your information</h5>

        <p>We use the information we collect in various ways, including to:</p>

        <ul>
          <li>Provide, operate, and maintain our webapp</li>
          <li>Improve, personalize, and expand our webapp</li>
          <li>Understand and analyze how you use our webapp</li>
          <li>Develop new products, services, features, and functionality</li>
          <li>
            Communicate with you, either directly or through one of our
            partners, including for customer service, to provide you with
            updates and other information relating to the webapp, and for
            marketing and promotional purposes
          </li>
          <li>Send you emails</li>
          <li>To provide you bill for the services that you have used.</li>
          <li>Find and prevent fraud</li>
        </ul>
        <h5>Cookies and Web Beacons</h5>

        <p>
          Like any other webapp, Reva Cabs uses 'cookies'. These cookies are
          used to store information including visitors' preferences, and the
          pages on the webapp that the visitor accessed or visited. The
          information is used to optimize the users' experience by customizing
          our web page content based on visitors' browser type and/or other
          information.
        </p>
        <h5>Children's Information</h5>

        <p>
          Another part of our priority is adding protection for children while
          using the internet. We encourage parents and guardians to observe,
          participate in, and/or monitor and guide their online activity.
        </p>

        <p>
          Reva Cabs does not knowingly collect any Personal Identifiable
          Information from children under the age of 13. If you think that your
          child provided this kind of information on our webapp, we strongly
          encourage you to contact us immediately and we will do our best
          efforts to promptly remove such information from our records.
        </p>
      </div>
    </section>
    </>
  );
};

export default Pripol;
