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
