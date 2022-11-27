import React from "react";
import "./css/term.css";
import { Helmet } from "react-helmet";

const Terms = () => {
  return (
    <>
    <Helmet>
    <meta http-equiv="Content-Security-Policy" content="script-src https://checkout.razorpay.com/v1/checkout.js *.revacabs.com;"/>
        <meta charSet="utf-8" />
        <title>Terms and Conditions - Revacabs</title>
        <meta
          name="description"
          content="These are the following terms that any individual should consider before using our services"
        />
         <meta name="keywords" content={"Reva Cabs, Reva Cabs Terms, Terms & condition"}/>
        <link rel="canonical" href="http://revacabs.com/" />
      </Helmet>
    <section className="term_sec">
      <div>
        <h5>Introduction</h5>
        <p>Welcome to Reva Cabs!</p>

        <p>
          These terms and conditions outline the rules and regulations for the
          use of Reva Cabs's Webapp, located at http://www.revacabs.com/.
        </p>

        <p>
          By accessing this webapp we assume you accept these terms and
          conditions. Do not continue to use Reva Cabs if you do not agree to
          take all of the terms and conditions stated on this page.
        </p>

        <p>
          The following terminology applies to these Terms and Conditions,
          Privacy Statement and Disclaimer Notice and all Agreements: "Client",
          "You" and "Your" refers to you, the person log on this webapp and
          compliant to the Company’s terms and conditions. "The Company",
          "Ourselves", "We", "Our" and "Us", refers to our Company. "Party",
          "Parties", or "Us", refers to both the Client and ourselves. All terms
          refer to the offer, acceptance and consideration of payment necessary
          to undertake the process of our assistance to the Client in the most
          appropriate manner for the express purpose of meeting the Client’s
          needs in respect of provision of the Company’s stated services, in
          accordance with and subject to, prevailing law of Netherlands. Any use
          of the above terminology or other words in the singular, plural,
          capitalization and/or he/she or they, are taken as interchangeable and
          therefore as referring to same.
        </p>
        <h5>
          <strong>Cookies</strong>
        </h5>

        <p>
          We employ the use of cookies. By accessing Reva Cabs, you agreed to
          use cookies in agreement with the Reva Cabs's Privacy Policy.{" "}
        </p>

        <p>
          Most interactive webapps use cookies to let us retrieve the user’s
          details for each visit. Cookies are used by our webapp to enable the
          functionality of certain areas to make it easier for people visiting
          our webapp. Some of our affiliate/advertising partners may also use
          cookies.
        </p>
        <h5>
          <strong>Removal of links or any other source from our webapp</strong>
        </h5>

        <p>
          If you find any link or any other source on our Webapp that is
          offensive for any reason, you are free to contact and inform us any
          moment. We will consider requests to remove links but we are not
          obligated to or so or to respond to you directly.
        </p>

        <p>
          We do not ensure that the information on this webapp is correct, we do
          not warrant its completeness or accuracy; nor do we promise to ensure
          that the webapp remains available or that the material on the webapp
          is kept up to date.
        </p>
        <h5>Terms of Use:</h5>
        <p>The use of this webapp is subject to the following terms of use:</p>
        <ol>
          <li>
            This webapp uses cookies to monitor browsing preferences. If you do
            allow cookies to be used, the following personal information may be
            stored by us for use by third parties: IP Address, Location
          </li>
          <li>
            The content of the pages of this webapp is for your general
            information and use only. It could be changed without any prior
            notice.
          </li>
          <li>
            Neither we nor any third parties provide any warranty or guarantee
            as to the accuracy, timeliness, performance, completeness or
            suitability of the information and materials found or offered on
            this webapp for any particular purpose. You acknowledge that such
            information and materials may contain inaccuracies or errors and we
            expressly exclude liability for any such inaccuracies or errors to
            the fullest extent permitted by law.
          </li>
          <li>
            Your use of any information or materials on this webapp is entirely
            at your own risk, for which we shall not be liable. It shall be your
            own responsibility to ensure that any products, services or
            information available through this webapp meet your specific
            requirements.
          </li>
          <li>
            Unauthorized use of this webapp may give rise to a claim for damages
            and/or be a criminal offence.
          </li>
          <li>
            Specific offers will have might have additional Terms & Conditions
            which the user has to comply with in case he chooses to avail that
            offer.
          </li>
        </ol>
        <h5>
          <strong> Payment </strong>
        </h5>
        <p>
          While doing payment of the service you have used or going to use you
          have to consider our fllowing payments terms which are as follow :
        </p>
        <ol>
          <li>
            We are a integral part of{" "}
            <a
              href="https://www.mathuracab.com/"
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none", color: "skyblue" }}
            >
              Mathura cab
            </a>
            . We states that all the bills that we provide for the payment of
            the services you have used are provided on the behalf of{" "}
            <a
              href="https://www.mathuracab.com/"
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none", color: "skyblue" }}
            >
              Mathura cab
            </a>
            .
          </li>
          <li>
            If any of the payment done by you is not reflected on our Webapp
            then Please contact us as soon as possible
          </li>
        </ol>
        <h5>
          <strong>Cancellation and Returns</strong>
        </h5>

        <p>
          You may cancel the booking 24 hour prior to the time of journey,
          without any cancellation charges for all services. In case
          cancellation or shorting of the trip is requested within 24 hours of
          the pick-up time, then A cancellation fee ( 10% of total booking
          amount ) will be applicable and still if there is any remaning balance
          from the advance then it will be refunded to you within 5-7 working
          days
        </p>
        <p>
          You cannot cancel the booking after the booking had been started by
          driver.
        </p>
        <p>
          Due to unavailability of cabs by any reason we can cancel your booking
          without any prior notice in that case and not liable to pay any
          incentive
        </p>
        <h5>
          <strong>Refund </strong>
        </h5>
        <p>
          if you are eligible for refunds based on the “Cancellation and
          Returns” policy above, then the refund will be remitted back to you in
          5-7 working days. In case of any issues, write to us at
          info@revacabs.com or call us at{" "}
          <a
            href="tel:+91 9456878882"
            style={{ textDecoration: "none", color: "skyblue" }}
          >
            9456878882
          </a>
        </p>
      </div>
    </section>
    </>
  );
};

export default Terms;
