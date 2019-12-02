"use strict";
const AWS = require("aws-sdk");
const axios = require("axios");

AWS.config.update({ region: "ap-southeast-2" });

exports.handler = async (event, context, callback) => {
  const ddb = new AWS.DynamoDB({ apiVersion: "2012-10-08" });
  const documentClient = new AWS.DynamoDB.DocumentClient({
    region: "ap-southeast-2"
  });

  const okResponse = {
    statusCode: 200,
    body: "OK"
  };

  const action = JSON.parse(event.body).action;

  // check to see if action is ping from greenhouse
  if (action == "ping") {
    return okResponse;
  }

  const job = JSON.parse(event.body).payload;
  const job_id = job.job_id.toString();
  const params = {
    TableName: "greenhouse-jobs",
    Key: {
      id: job_id
    }
  };

  const put_params = {
    TableName: "greenhouse-jobs",
    Item: {
      id: job_id
    }
  };

  const getRecruiters = city => {
    if (city.includes("melbourne") || city.includes("richmond")) {
      return "<@UD8RVRA0P>, <@UM9VA63B7> or <@UDPNAAF4Z>";
    }
    if (city.includes("sf") || city.includes("francisco")) {
      return "<@UJCTN4THT>";
    }
    if (city.includes("ny") || city.includes("york")) {
      return "<@UBPLLR0GN>";
    }
    if (city.includes("london") || city.includes("kingdom")) {
      return "<@UBPLLR0GN>";
    }
    if (city.includes("remote")) {
      return "<@UBPLLR0GN>";
    }
    return "<@team_talent_acquisition>";
  };

  const handleSlackMessages = async city => {
    if (city.includes("melbourne") || city.includes("richmond")) {
      await postToSlackWebhook(process.env.MEL);
    }
    if (city.includes("francisco")) {
      await postToSlackWebhook(process.env.SF);
    }
    if (city.includes("ny") || city.includes("york")) {
      await postToSlackWebhook(process.env.NY);
    }
    if (city.includes("london") || city.includes("kingdom")) {
      await postToSlackWebhook(process.env.UK);
    }
    if (city.includes("remote")) {
      await postToSlackWebhook(process.env.REMOTE);
    }
    await postToSlackWebhook(process.env.JO);
  };

  const jobURL = `https://boards.greenhouse.io/cultureamp/jobs/${job.id}`;
  const recruiters = getRecruiters(job.location.toLowerCase());
  const message = `Title: *${job.title}* \n Location: *${job.location}* \n Contact: ${recruiters} to find out more! \n :point_right: <${jobURL}|View job post>`;

  if (action != "job_post_updated" || !job.live) {
    return okResponse;
  }

  const postToSlackWebhook = async webhook => {
    const officeURL = `https://hooks.slack.com/services/${webhook}`;
    const result = await axios.post(
      officeURL,
      {
        text:
          ":wave: Hey Campers, we just opened a new role at Culture Amp :ca:",
        attachments: [
          {
            color: "#F04C5D",
            text: message
          }
        ]
      },
      { headers: { "Content-Type": "application/json" } }
    );
    console.log(result);
  };

  try {
    const data = await documentClient.get(params).promise();
    console.log(Object.keys(data));
    if (Object.keys(data).length === 0) {
      const data = await documentClient.put(put_params).promise();
      console.log(data);
      await handleSlackMessages(job.location.toLowerCase());
    } else {
      console.log("already posted");
    }
  } catch (err) {
    console.log(err);
  }
  return okResponse;
};
