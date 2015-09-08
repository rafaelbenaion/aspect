json.array!(@measures) do |measure|
  json.extract! measure, :id, :from, :set
  json.url measure_url(measure, format: :json)
end
