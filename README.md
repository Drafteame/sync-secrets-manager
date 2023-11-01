# sync-secrets-manager

Github action that sync an AWS Secrets Manager and it's values from a provided json file

## Usage

### Required AWS Permissions

- `secretsmanager:UpdateSecret`
- `secretsmanager:GetSecretValue`

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
          dry_run: true # Default false
          show_values: false # If true secret values will be displayed on action logs (default false)
          exclude: '^_' # Regular expression that excludes the matching keys to be synced (default '^_')
```
