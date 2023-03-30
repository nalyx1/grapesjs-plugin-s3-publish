import axios from "axios";

export default (editor, opts = {}) => {
  const { domain, id, action } = opts;
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

  const newButton = panelManager.addButton("options", {
    id: btnText,
    className: icon,
    command: "publishToS3",
    attributes: { title: btnText },
    active: false,
  });

  editor.Commands.add("publishToS3", {
    run: async (editor) => {
      const htmlFileBody = `${preHtml}${editor.getHtml()}${postHtml}`;
      const styleFileBody = `${preCss}${editor.getCss()}${postCss}`;

      await axios.post(`https://gestao.abare.cloud/lp-builder/deploy/s3`, {
        action,
        domain,
        lp: {
          id: id,
          content: [
            {
              body: {
                Key: "index.html",
                Body: htmlFileBody,
                ContentType: htmlContentType,
              },
            },
            {
              body: {
                Key: "style.css",
                Body: styleFileBody,
                ContentType: cssContentType,
              },
            },
          ],
        },
      });
      const command = editor.Commands.get("publishToS3");
      command.stop();
    },
    stop: () => newButton.set("active", false),
  });
};

