# AWSJobBot

## Purpose

Culture Amp's recruitment team wanted to inform motivate internal staff to both apply for and recommend individuals for new job opportunities at Culture Amp.

To solve this problem, I wrote a quick lambda function which posts new job opportunities to the relevant slack channel.

### Implementation

- Set up greenhouse webhook to POST to our API endpoint when a job has been updated (https://developers.greenhouse.io/webhooks.html#job-post-updated)

- Handle and read in the JSON payload, double check the data received is from the correct source (done via AWS API gateway w/ secret key)

- Double check against our AWS DynamoDB `greenhouse-jobs` table, to see if we've posted about this job before. If we haven't, this means the job has gone live for the first time.

- Determine the message to send to slack, using the request body to determine office and text location.

- Log relevant information to AWS Cloudwatch

- Post via slack webhook, using API keys stored in AWS environment variables
