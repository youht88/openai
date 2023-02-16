pip3 install openai
openai tools fine_tunes.prepare_data -f "train1.csv"
openai -k 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 api fine_tunes.create -t "train1_prepared.jsonl" -m ada 
openai -k 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 api completions.create -m ada:ft-personal-2023-01-14-10-27-35 -M 1 -p "看了两个小时的书 ->"

openai tools fine_tunes.prepare_data -f "train2.csv"
openai -k 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 api fine_tunes.create -t "train2_prepared.jsonl" -m ada:ft-personal-2023-01-14-10-27-35
openai -o org-OS0Puv8UD6gZhnDvMGnfZobp -k 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 api completions.create -m ada:ft-personal-2023-01-14-10-58-38 -M 1 -p "看了两个小时的书 ->"

openai -o org-OS0Puv8UD6gZhnDvMGnfZobp -k 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 api completions.create -m ada:ft-personal-2023-01-14-10-58-38 -M 1 -p "看了两个小时的书 ->"

#openai_0002:
openai -o org-OS0Puv8UD6gZhnDvMGnfZobp -k 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 api completions.create -m ada:ft-personal-2023-01-14-10-58-38 -M 1 -p "看了两个小时的书 ->"

#openai_0003:
openai -o org-OS0Puv8UD6gZhnDvMGnfZobp -k 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 api completions.create -m ada:ft-personal-2023-01-14-10-58-38 -M 1 -p "看了两个小时的书 ->"

#openai_0004:
openai -o org-OS0Puv8UD6gZhnDvMGnfZobp -k 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 api completions.create -m ada:ft-personal-2023-01-14-10-58-38 -M 1 -p "看了两个小时的书 ->"

#openai_0005:
openai -o org-OS0Puv8UD6gZhnDvMGnfZobp -k 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 api completions.create -m ada:ft-personal-2023-01-14-10-58-38 -M 1 -p "看了两个小时的书 ->"
openai -o org-OS0Puv8UD6gZhnDvMGnfZobp -k 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 api completions.create -m ada:ft-personal-2023-01-14-10-58-38 -M 1 -p "看了两个小时的书 ->"

#openai_0006
openai -o org-OS0Puv8UD6gZhnDvMGnfZobp -k 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 api completions.create -m ada:ft-personal-2023-01-14-10-58-38 -M 1 -p "看了两个小时的书 ->"


openai -k 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 api fine_tunes.create -t "train4_prepared.jsonl" -m ada

openai -k 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  api fine_tunes.follow -i ft-o03mP76EU79whI89btUmW4cY
[2023-02-10 02:37:21] Created fine-tune: ft-o03mP76EU79whI89btUmW4cY
[2023-02-10 02:45:17] Fine-tune costs $0.00
[2023-02-10 02:45:18] Fine-tune enqueued. Queue number: 2
[2023-02-10 02:48:06] Fine-tune is in the queue. Queue number: 1
[2023-02-10 02:54:09] Fine-tune is in the queue. Queue number: 0
[2023-02-10 02:57:03] Fine-tune started
[2023-02-10 02:57:17] Completed epoch 1/4
[2023-02-10 02:57:17] Completed epoch 2/4
[2023-02-10 02:57:18] Completed epoch 3/4
[2023-02-10 02:57:19] Completed epoch 4/4
[2023-02-10 02:57:34] Uploaded model: ada:ft-test001-2023-02-09-18-57-34
[2023-02-10 02:57:35] Uploaded result file: file-CFY71tkYftATxqT3tDZwcLu0
[2023-02-10 02:57:35] Fine-tune succeeded

Job complete! Status: succeeded 🎉
Try out your fine-tuned model:

openai api completions.create -m ada:ft-test001-2023-02-09-18-57-34 -p <YOUR_PROMPT>
openai -k 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 api completions.create -m ada:ft-test001-2023-02-09-18-57-34 -p "两个小时前喝了一碗西红柿蛋汤 ->"

openai -k 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 api fine_tunes.create -t "train4_prepared.jsonl" -m davinci
openai -k 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 api fine_tunes.create -t "train5_prepared.jsonl" -m davinci

{"prompt":"Portugal will be removed from the UK's green travel list from Tuesday, 
   amid rising coronavirus cases and concern over a \"Nepal mutation of the so-called Indian variant\". 
   It will join the amber list, meaning holidaymakers should not visit and returnees must isolate for 10 days...\n\n###\n\n", 
 "completion":" Portugal\nUK\nNepal mutation\nIndian variant END"}

 {"prompt":"Summary: <summary of the interaction so far>\n\n
           Specific information:<for example order details in natural language>\n\n###\n\n
           Customer: <message1>\nAgent: <response1>\n
           Customer: <message2>\nAgent:", "completion":" <response2>\n"}
{"prompt":"Summary: <summary of the interaction so far>\n\n
           Specific information:<for example order details in natural language>\n\n###\n\n
          Customer: <message1>\nAgent: <response1>\n
          Customer: <message2>\nAgent: <response2>\n
          Customer: <message3>\nAgent:", "completion":" <response3>\n"}