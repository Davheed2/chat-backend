export const baseTemplate = (template: string): string => {
	return `<!DOCTYPE html>
  <html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Welcome to Davheed</title>
    <style type="text/css" rel="stylesheet" media="all">
      /* Base Styles */
      @import url('https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&display=swap');
      body {
        width: 100% !important;
        height: 100%;
        margin: 0;
        font-family: 'Nunito Sans', Helvetica, Arial, sans-serif;
        background-color: #F2F4F6;
        color: #51545E;
      }
      a {
        color: #3869D4;
      }
      /* Email Container */
      .email-wrapper {
        width: 100%;
        margin: 0;
        padding: 0;
        background-color: #F2F4F6;
      }
      .email-content {
        width: 100%;
        margin: 0;
        padding: 0;
      }
      /* Masthead */
      .email-masthead {
        padding: 25px 0;
        text-align: center;
      }
      .email-masthead_name {
        font-size: 16px;
        font-weight: bold;
        color: #A8AAAF;
        text-decoration: none;
      }
      /* Email Body */
      .email-body {
        width: 100%;
        margin: 0;
        padding: 0;
      }
      .email-body_inner {
        width: 570px;
        margin: 0 auto;
        padding: 0;
        background-color: #FFFFFF;
      }
      .content-cell {
        padding: 45px;
      }
      /* Footer */
      .email-footer {
        width: 570px;
        margin: 0 auto;
        padding: 0;
        text-align: center;
      }
      .email-footer p {
        color: #A8AAAF;
      }
      /* Buttons */
      .button {
        background-color: #3869D4;
        border-radius: 3px;
        color: #FFF;
        display: inline-block;
        text-decoration: none;
        padding: 10px 18px;
      }
      .button--green {
        background-color: #22BC66;
      }
      .button--red {
        background-color: #FF6136;
      }
      /* Media Queries */
      @media only screen and (max-width: 600px) {
        .email-body_inner,
        .email-footer {
          width: 100% !important;
        }
      }
    </style>
  </head>
  <body>
    <table class="email-wrapper" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center">
          <table class="email-content" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td class="email-masthead">
                <a href="https://www.davheed.com" class="f-fallback email-masthead_name">
                  DAVHEED
                </a>
              </td>
            </tr>
            <!-- Email Body -->
            <tr>
              <td class="email-body" cellpadding="0" cellspacing="0">
                <table class="email-body_inner" align="center" cellpadding="0" cellspacing="0" role="presentation">
                  <!-- Body content -->
                  <tr>
                    <td class="content-cell">
                      ${template}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td>
                <table class="email-footer" align="center" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td class="content-cell" align="center">
                      <p>&copy; ${new Date().getFullYear()} Davheed. All rights reserved.</p>
                      <p>
                        Davheed<br />
                        Awka, Nigeria
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
};
