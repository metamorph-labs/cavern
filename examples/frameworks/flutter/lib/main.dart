import 'package:flutter/material.dart';
import 'package:metamorph_cavern/cavern.dart';

void main() => runApp(const CavernExample());

class CavernExample extends StatelessWidget {
  const CavernExample({super.key});
  @override
  Widget build(BuildContext context) => const MaterialApp(home: FilePage());
}

class FilePage extends StatefulWidget {
  const FilePage({super.key});
  @override
  State<FilePage> createState() => _FilePageState();
}

class _FilePageState extends State<FilePage> {
  String state = 'Loading…';

  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    try {
      final client = CavernDataClient(
          baseUrl: required('CAVERN_BASE_URL'),
          capability: () => required('CAVERN_CAPABILITY'),
          retry: const RetryPolicy(
              maxAttempts: 3,
              baseDelay: Duration(milliseconds: 100),
              maximumDelay: Duration(seconds: 2)));
      final entry = await client.getFileMetadataWithCapability(FileReference(
          tenantId: required('CAVERN_TENANT_ID'),
          projectId: required('CAVERN_PROJECT_ID'),
          environmentId: required('CAVERN_ENVIRONMENT_ID'),
          collectionInstanceId: required('CAVERN_COLLECTION_ID'),
          entryId: required('CAVERN_ENTRY_ID'))) as Map<String, Object?>;
      if (mounted) setState(() => state = '${entry['logical_path']} — ${entry['lifecycle']}');
    } catch (error) {
      if (mounted) setState(() => state = 'Read refused: $error');
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
      appBar: AppBar(title: const Text('Cavern managed-development read')),
      body: Center(child: Text(state)),
      floatingActionButton: FloatingActionButton(onPressed: load, child: const Icon(Icons.refresh)));
}

String required(String name) {
  const values = {
    'CAVERN_BASE_URL': String.fromEnvironment('CAVERN_BASE_URL'),
    'CAVERN_CAPABILITY': String.fromEnvironment('CAVERN_CAPABILITY'),
    'CAVERN_TENANT_ID': String.fromEnvironment('CAVERN_TENANT_ID'),
    'CAVERN_PROJECT_ID': String.fromEnvironment('CAVERN_PROJECT_ID'),
    'CAVERN_ENVIRONMENT_ID': String.fromEnvironment('CAVERN_ENVIRONMENT_ID'),
    'CAVERN_COLLECTION_ID': String.fromEnvironment('CAVERN_COLLECTION_ID'),
    'CAVERN_ENTRY_ID': String.fromEnvironment('CAVERN_ENTRY_ID'),
  };
  final value = values[name] ?? '';
  if (value.isEmpty) throw StateError('$name is required');
  return value;
}
