# sync-secrets-manager

Github action that sync an AWS Secrets Manager and it's values from a provided json file

## Usage

### Required AWS Permissions

- `secretsmanager:UpdateSecret`
- `secretsmanager:GetSecretValue`
- `secretsmanager:ListSecrets`
- `secretsmanager:CreateSecret`

### Configuration

```yml
jobs:
  sync-secrets:
    name: Sync secrets
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Sync
        uses: Drafteame/sync-secrets-manager@main
        with:
          aws_access_key_id: <access-key-id>
          aws_secret_access_key: <secret-access-key>
          aws_region: <region>
          secret_name: <secret-name>
          json_file_path: path/to/json/secrets.json
          create_secret: false # If true it will check if the secret exists or not to create it before execute sync (default false)
          dry_run: true # Default false
          show_values: false # If true secret values will be displayed on action logs (default false)
          exclude: "^_" # Regular expression that excludes the matching keys to be synced (default '^_')
          delete_secret: false # If true it will delete the secret instead of creating or updating its values. 
```

### Syncing secrets

This should be the configuration to sync the secret values from a json file to the AWS Secrets Manager.

```yml
jobs:
  sync-secrets:
    name: Sync secrets
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Sync
        uses: Drafteame/sync-secrets-manager@main
        with:
          aws_access_key_id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws_secret_access_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws_region: us-east-1
          secret_name: my-secret
          json_file_path: path/to/json/secrets.json

          # Optional if secret does not exist
          create_secret: true
```

### Deleting secrets

This should be the configuration to delete the secret from the AWS Secrets Manager.

```yml
jobs:
  sync-secrets:
    name: Sync secrets
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Sync
        uses: Drafteame/sync-secrets-manager@main
        with:
          aws_access_key_id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws_secret_access_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws_region: us-east-1
          secret_name: my-secret
          delete_secret: true
```
