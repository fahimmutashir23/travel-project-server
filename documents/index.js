

module.exports = ( invoice ) => {
 
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice</title>
      <style>
          body {
              font-family: Arial, sans-serif;
          }
          .invoice {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ccc;
              position: relative;
          }
          .invoice h2 {
              text-align: center;
              margin-top: 0;
              text-transform: uppercase;
          }
          .company-name {
              text-align: right;
              font-size: 32px;
              font-weight: bold;
              color: green;
          }
          .office-address {
              text-align: right;
              font-size: 14px;
              margin-top: 8px;
          }
          .flex {
              position: relative;
              top: 20px;
          }
          .contact-info {
              text-align: left;
              margin-top: 50px;
              font-size: 14px;
          }
          .contact-info p {
              margin-top: -10px;
          }
          .invoice-info {
              text-align: left;
              position: absolute;
              left: 0;
              top: 0;
          }
          .invoice-info p {
              margin: 5px 0;
          }
          .invoice table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
          }
          .invoice table th, .invoice table td {
              padding: 10px;
              border: 1px solid #ccc;
          }
          .invoice table th {
              background-color: #f2f2f2;
          }
          .invoice table td {
              text-align: center;
          }
          .total {
              margin-top: 20px;
              text-align: right;
          }
          .bottom p {
              text-align: center;
              margin-top: 20px;
              font-weight: 600;
          }
          .image {
              position: absolute;
              width: 60px;
              top: 20px;
              right: 20px;
          }
      </style>
  </head>
  <body>
      <div class="invoice">
          <h2>Invoice</h2>
          <img src="https://i.postimg.cc/JhLmcHNV/Logo3.png" class="image" alt="">
         <div class="flex">
          <div class="invoice-info">
              <p><strong>Invoice Number:</strong> INV-001</p>
              <p><strong>Date:</strong> ${invoice?.date}</p>
          </div>
          <div>
              <div class="company-name">
                  Our Travels
              </div>
              <div class="office-address">
                  Dhanmondi-27, Dhaka-1205 <br>
                  Bangladesh <br>
                  Phone: +880 1581 868984 
              </div>
          </div>
         </div>
          <div class="contact-info">
              <p><strong>Contact Information:</strong></p>
              <p>Name: ${invoice?.name} </p>
              <p>Email: ${invoice?.email}</p>
              <p>Phone: ${invoice?.phone}</p>
          </div>
          <table>
              <thead>
                  <tr>
                      <th>SL</th>
                      <th>Description</th>
                      <th>Amount</th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td>1</td>
                      <td>${invoice?.descriptions}</td>
                      <td>${invoice?.amount}$</td>
                  </tr>
              </tbody>
          </table>
          <div class="total">
              <p><strong>Total:</strong>${invoice?.amount}</p>
          </div>
          <div class="bottom">
              <p>If you have any questions about this invoice, please contact us via email. <br> Must include your Name, Email, and Phone number.</p>
          </div>
      </div>
  </body>
  </html>
  
    `;
};
