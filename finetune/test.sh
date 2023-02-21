pip3 install openai
openai tools fine_tunes.prepare_data -f "train1.csv"
openai -k <sk1> api fine_tunes.create -t "train1_prepared.jsonl" -m ada 
openai -k <sk1> api completions.create -m ada:ft-personal-2023-01-14-10-27-35 -M 1 -p "看了两个小时的书 ->"

openai tools fine_tunes.prepare_data -f "train2.csv"
openai -k <sk1> api fine_tunes.create -t "train2_prepared.jsonl" -m ada:ft-personal-2023-01-14-10-27-35
openai -o org-OS0Puv8UD6gZhnDvMGnfZobp -k <sk1> api completions.create -m ada:ft-personal-2023-01-14-10-58-38 -M 1 -p "看了两个小时的书 ->"

openai -o org-OS0Puv8UD6gZhnDvMGnfZobp -k <sk2> api completions.create -m ada:ft-personal-2023-01-14-10-58-38 -M 1 -p "看了两个小时的书 ->"

