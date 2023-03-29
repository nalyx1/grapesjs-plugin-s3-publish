import AWS from "aws-sdk";
import axios from "axios";

export default (editor, opts = {}) => {
  const { accessKeyId, secretAccessKey, bucketName, id } = opts;
  const panelManager = editor.Panels;
  const htmlContentType = "text/html";
  const cssContentType = "text/css";
  const btnText = "Publicar";
  const icon = "fa fa-paper-plane";
  const preHtml =
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="./style.css"></head>';
  const postHtml = "<html>";
  const preCss = "";
  const postCss = "";

  AWS.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  });

  if (![accessKeyId, secretAccessKey].every(Boolean)) {
    throw new Error("Configuração do AWS está faltando");
  }

  const newButton = panelManager.addButton("options", {
    id: btnText,
    className: icon,
    command: "publishToS3",
    attributes: { title: btnText },
    active: false,
  });

  editor.Commands.add("publishToS3", {
    run: async (editor, sender) => {
      const htmlFileBody = `${preHtml}${editor.getHtml()}${postHtml}`;
      const styleFileBody = `${preCss}${editor.getCss()}${postCss}`;

      const { data } = await axios.post(`http://localhost:8056/lp-builder/deploy/s3`, {
        bucketName: bucketName,
        lp: {
          "id": id,
          "content": [
          {
            body: {
              Body: htmlFileBody,
              Key: "index.html",
              ContentType: htmlContentType,
            },
          },
          {
            body: {
              Body: styleFileBody,
              Key: "style.css",
              ContentType: cssContentType,
            },
          },
        ]},
      });

      console.log(data);
      // console.log(styleFileBody);

      // const s3 = new AWS.S3();

      // s3.createBucket(
      //   { Bucket: "lp-tonelli-sanja-duisahduysdsahu" },
      //   (err, data) => {
      //     if (err) {
      //       console.error(err);
      //     } else {
      //       console.log(data);
      //     }
      //   }
      // );

      // const s3PublishPromises = [
      //   { body: htmlFileBody, key: "index.html", mimeType: htmlContentType },
      //   { body: styleFileBody, key: "style.css", mimeType: cssContentType },
      // ].map(
      //   (file) =>
      //     new Promise((resolve, reject) => {
      //       const s3Params = {
      //         Bucket: "lp-tonelli-sanja-duisahduysdsahu",
      //         Body: file.body,
      //         Key: `${prefix}/${file.key}`,
      //         ContentType: file.mimeType,
      //       };
      //       s3.putObject(s3Params, (err, data) => {
      //         if (err) {
      //           console.error(err);
      //           reject(err);
      //         } else {
      //           console.log(data);
      //           resolve(data);
      //         }
      //       });
      //     })
      // );

      await Promise.all(s3PublishPromises);
      const command = editor.Commands.get("publishToS3");
      command.stop();
    },
    stop: () => newButton.set("active", false),
  });
};

