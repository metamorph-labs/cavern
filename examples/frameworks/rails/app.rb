# frozen_string_literal: true

require "rails"
require "action_controller/railtie"
require "cavern"

def required(name)
  ENV.fetch(name) { raise "#{name} is required" }
end

class CavernExample < Rails::Application
  config.eager_load = false
  config.logger = Logger.new($stdout)
  config.secret_key_base = "development-only-not-an-cavern-credential"
  config.hosts.clear
end

class FilesController < ActionController::API
  def show
    return render(json: { code: "CAVERN_EXAMPLE_FORBIDDEN" }, status: :forbidden) unless request.headers["X-App-User"].present?

    client = Cavern::DataClient.new(
      base_url: required("CAVERN_BASE_URL"),
      capability: -> { required("CAVERN_CAPABILITY") },
      retry_policy: Cavern::RetryPolicy.new(max_attempts: 3, base_delay_seconds: 0.1, maximum_delay_seconds: 2)
    )
    entry = client.get_file_metadata_with_capability(Cavern::FileReference.new(
      tenant_id: required("CAVERN_TENANT_ID"), project_id: required("CAVERN_PROJECT_ID"),
      environment_id: required("CAVERN_ENVIRONMENT_ID"), collection_instance_id: required("CAVERN_COLLECTION_ID"),
      entry_id: params.fetch(:entry_id)
    ))
    render json: entry
  end
end

CavernExample.routes.draw { get "/files/:entry_id", to: "files#show" }
