import express from "express";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import axios from "axios";


const getDirname = (importMetaUrl) => {
  const url = new URL(importMetaUrl);
  return path.dirname(url.pathname);
};

const __dirname = getDirname(import.meta.url); // Ensure this is initialized correctly

const app = express();

const API_URL = "http://192.168.1.11/rppl/api/get-project-data?id=7";


app.use("/assets", express.static(path.join(__dirname, "..", "assets")));


app.get("/generate-pdf", async (req, res) => {
  try {
  
    const response = await axios.get(API_URL);
    const { status, comp_data, project_data, to_data, emails, letter_type } =
      response.data;

    if (status !== "success") {
      return res.status(500).send("Failed to fetch data from the API.");
    }

    const { company_name, address, state, gst_no, pan_no, letter_head } =
      comp_data;

    const {
      letter_date,
      ref_number,
      subject,
      ref,
      letter_body,
      name_of_work,
      name_of_department,
      city_village,
    } = project_data;

  
    const fontPath = path.join(
      "C:/Users/lenovo/Downloads/Mukta_Vaani/MuktaVaani-Regular.ttf"
    );

    const boldFontPath = path.join("C:/Users/lenovo/Downloads/Mukta_Vaani/MuktaVaani-Medium.ttf")

    
    if (!fs.existsSync(fontPath)) {
      console.error("Font file not found:", fontPath);
      return res.status(500).send("Font file not found.");
    }

    if (!fs.existsSync(boldFontPath)) {
        console.error("Font file not found:", boldFontPath);
        return res.status(500).send("Font file not found.");
      }

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

  
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=generated.pdf");

    doc.pipe(res);

    const pagewidth = doc.page.width;
    const pageheight = doc.page.height;
    const topMargin = 150;

  
    doc
      .image("C:/Users/lenovo/Downloads/letter_head.jpg", 0, 0, {
        width: pagewidth,
        height: pageheight,
      })
      .stroke();

    doc
      .font(boldFontPath)
      .fontSize(12)
      .text(
        "// " + letter_type + " //",
        { align: "center", underline: true },
        150,
        topMargin
      );

    doc.font(fontPath).fontSize(12).text(`Ref. : ${ref_number}`, 30, 165);
    doc.fontSize(12).text(`Date : ${letter_date}`, 30, 165, { align: "right" });

    doc.moveDown(0.5);
    doc.fontSize(12).text("To,");
    doc.text(to_data);
    doc.text(name_of_department);
    doc.text(city_village);

    doc.moveDown(0.5);
    doc.font(boldFontPath).fontSize(12).text(`Subject:`,{continued: true}).font(fontPath).fontSize(12).text(`${subject}`);
    doc.moveDown(0.2);

    doc
    .font(boldFontPath)
      .fontSize(12)
      .text(`Name of work:`,{continued: true}).font(fontPath).fontSize(12).text(` ${name_of_work}`, { align: "justify", lineGap: -3 });
    doc.fontSize(12).text(`Ref: `,{continued: true}).font(fontPath).fontSize(12).text(`${ref}`, { align: "justify" }).font(boldFontPath).fontSize(12).text(`E-mail:`,{continued: true}).font(fontPath).fontSize(12).text(`${emails}`);

    doc.moveDown(0.5);
    doc.fontSize(12).text("Respected sir,");
    doc.moveDown(0.5);

    doc
      .fontSize(12)
      .text(letter_body, { indent: 30, align: "justify", lineGap: -3 });

    doc.moveDown(0.5);
    doc.fontSize(12).text("Thanking You,");
    doc.moveDown(-0.2);
    doc.fontSize(12).text(`For, ${company_name}`);
    doc.moveDown(0.5);
    doc.text(`Address: ${address}, ${state}`);
    doc.moveDown(-0.2);
    doc.text(`GST No: ${gst_no}, PAN No: ${pan_no}`);


    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error.message);
    res.status(500).send("An error occurred while generating the PDF.");
  }
}); 

export default app