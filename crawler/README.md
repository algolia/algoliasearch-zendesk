# Usage

Initialize docker

    docker build -t zendesk-hc-connector .

Then either run the instance with a Zendesk API key:

    docker run -e CONFIG='{
      "app_name": "my-zendesk-subdomain",
      "email": "**************",
      "api_token": "********************"
    }' zendesk-hc-connector

Or an OAuth token:

// TODO
