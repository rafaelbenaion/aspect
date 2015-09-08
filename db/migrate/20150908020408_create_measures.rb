class CreateMeasures < ActiveRecord::Migration
  def change
    create_table :measures do |t|
      t.jsonb :from
      t.jsonb :set

      t.timestamps null: false
    end
  end
end
