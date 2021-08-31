# IPPrinter

This is a web appliation I developed to see the incomming connections to the company´s SAP Fiori ERP website.

The configuration of the website is done with a web dispatcher in the gateway machine (client side)

The incomming connections are represented in the .icp file (/sap/wdisp/admin/icp/show_conns.icp)

If the connection comes from a company office (its IP starts with local 10.x address) I have a sepparate harcode file to identfy them. 

If the connection comes from a global IP, I use a public geo location API to locate it´s origin as accurate as it can be.

It uses an authentication token to login to the web dispatcher server.

Then it prints the OpenStreets map with the local and global connections displayed with blue and grenn markers.

I think there should be a much easier way to do this... but this is what I proposed in that time.

Any support from SAP users will be appreciated!!

<a href="https://www.buymeacoffee.com/globaldiscovery" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
