'use strict';

const harness = require('@terascope/teraslice-op-test-harness');
const fs = require('fs');
const processor = require('../asset/file_exporter');


const testHarness = harness(processor);
// console.log(testHarness.run)

// Make sure there is a clean output directory for each test cycle. Removes lingering output files
// in the directory or creates the directory if it doesn't exist
function cleanTestDir() {
    if (fs.readdirSync('./spec').indexOf('test_output') > -1) {
        if (fs.readdirSync('./spec/test_output').length > 0) {
            fs.readdirSync('./spec/test_output').forEach(file => fs.unlinkSync(`./spec/test_output/${file}`));
        }
    } else {
        fs.mkdirSync('./spec/test_output');
    }
}

// Not sure how to get context in with the teraslice-op-test-harness. Assumption is that the
// worker's name comes from context.sysconfig._nodeName based on code from the HDFS file chunker

// const context = {
//     foundation: {
//     },
//     sysconfig: {
//         _nodeName: 'ts-node-1'
//     }
// };

const data = [
    {
        field1: 42,
        field3: 'test data',
        field2: 55
    },
    {
        field1: 43,
        field3: 'more test data',
        field2: 56
    },
    {
        field1: 44,
        field3: 'even more test data',
        field2: 57
    }
];

const data2 = [
    'record1',
    'record2',
    'record3'
];

const caseMultiFileSpecifyFields = {
    _op: 'csv_exporter',
    path: './spec/test_output',
    file_prefix: 'test',
    format: 'csv',
    fields: [
        'field3',
        'field1'
    ],
    file_per_slice: true
};

const caseMultiFileAllFields = {
    _op: 'csv_exporter',
    path: './spec/test_output',
    file_prefix: 'test',
    format: 'csv',
    file_per_slice: true
};

const caseMultiFileAllFieldsHeader = {
    _op: 'csv_exporter',
    path: './spec/test_output',
    file_prefix: 'test',
    file_per_slice: true,
    format: 'csv',
    include_header: true
};

const caseSingleFileSpecifyFields = {
    _op: 'csv_exporter',
    path: './spec/test_output',
    file_prefix: 'test',
    format: 'csv',
    fields: [
        'field3',
        'field1'
    ]
};

const caseSingleFileAllFields = {
    _op: 'csv_exporter',
    path: './spec/test_output',
    format: 'csv',
    file_prefix: 'test'
};

const caseSingleFileAllFieldsHeader = {
    _op: 'csv_exporter',
    path: './spec/test_output',
    file_prefix: 'test',
    format: 'csv',
    include_header: true
};

// Testing a tab delimiter
const caseTabDelimiter = {
    _op: 'csv_exporter',
    path: './spec/test_output',
    file_prefix: 'test',
    format: 'tsv'
};

// Testing a custom delimiter
const caseCustomDelimiter = {
    _op: 'csv_exporter',
    path: './spec/test_output',
    file_prefix: 'test',
    delimiter: '^',
    format: 'csv'
};

const caseJSON2File = {
    _op: 'csv_exporter',
    path: './spec/test_output',
    file_prefix: 'test',
    format: 'json'
};

const caseText2File = {
    _op: 'csv_exporter',
    path: './spec/test_output',
    file_prefix: 'test',
    format: 'text'
};

// const metricPayload = harness.run(data, opConfig);

describe('The file-assets csv_exporter processor', () => {
    it('provides a config schema for use with convict', () => {
        const schema = processor.schema();
        expect(schema.path.default).toEqual(null);
        expect(schema.file_prefix.default).toEqual('export');
        expect(schema.fields.default).toEqual([]);
        expect(schema.delimiter.default).toEqual(',');
        expect(schema.format.default).toEqual('json');
        expect(schema.file_per_slice.default).toEqual(false);
        expect(schema.include_header.default).toEqual(false);
    });
    cleanTestDir();
    it('creates multiple files with specific fields', (done) => {
        const opConfig = caseMultiFileSpecifyFields;
        const slices = [data, data];
        testHarness.runSlices(slices, opConfig)
            .then(() => {
                // This should be equal to three since the test harnes shoves an empty slice through
                expect(fs.readdirSync('./spec/test_output').length).toEqual(3);
                expect(fs.readFileSync('./spec/test_output/test_undefined.0', 'utf-8')).toEqual(
                    '"test data",42\n"more test data",43\n"even more test data",44\n'
                );
                expect(fs.readFileSync('./spec/test_output/test_undefined.1', 'utf-8')).toEqual(
                    '"test data",42\n"more test data",43\n"even more test data",44\n'
                );
                cleanTestDir();
                done();
            });
    });
    it('creates multiple files with all fields', (done) => {
        const opConfig = caseMultiFileAllFields;
        const slices = [data, data];
        testHarness.runSlices(slices, opConfig)
            .then(() => {
                // This should be equal to three since the test harnes shoves an empty slice through
                expect(fs.readdirSync('./spec/test_output').length).toEqual(3);
                expect(fs.readFileSync('./spec/test_output/test_undefined.0', 'utf-8')).toEqual(
                    '42,"test data",55\n43,"more test data",56\n44,"even more test data",57\n'
                );
                expect(fs.readFileSync('./spec/test_output/test_undefined.1', 'utf-8')).toEqual(
                    '42,"test data",55\n43,"more test data",56\n44,"even more test data",57\n'
                );
                cleanTestDir();
                done();
            });
    });
    it('creates multiple files with all fields and headers', (done) => {
        const opConfig = caseMultiFileAllFieldsHeader;
        const slices = [data, data];
        testHarness.runSlices(slices, opConfig)
            .then(() => {
                // This should be equal to three since the test harnes shoves an empty slice through
                expect(fs.readdirSync('./spec/test_output').length).toEqual(3);
                expect(fs.readFileSync('./spec/test_output/test_undefined.0', 'utf-8')).toEqual(
                    '"field1","field3","field2"\n'
                    + '42,"test data",55\n'
                    + '43,"more test data",56\n'
                    + '44,"even more test data",57\n'
                );
                expect(fs.readFileSync('./spec/test_output/test_undefined.1', 'utf-8')).toEqual(
                    '"field1","field3","field2"\n'
                    + '42,"test data",55\n'
                    + '43,"more test data",56\n'
                    + '44,"even more test data",57\n'
                );
                cleanTestDir();
                done();
            });
    });
    it('creates a single file with custom fields', (done) => {
        const opConfig = caseSingleFileSpecifyFields;
        const slices = [data, data];
        testHarness.runSlices(slices, opConfig)
            .then(() => {
                expect(fs.readdirSync('./spec/test_output').length).toEqual(1);
                expect(fs.readFileSync('./spec/test_output/test_undefined', 'utf-8')).toEqual(
                    '"test data",42\n'
                    + '"more test data",43\n'
                    + '"even more test data",44\n'
                    + '"test data",42\n'
                    + '"more test data",43\n'
                    + '"even more test data",44\n\n'
                );
                cleanTestDir();
                done();
            });
    });
    it('creates a single file with all fields', (done) => {
        const opConfig = caseSingleFileAllFields;
        const slices = [data, data];
        testHarness.runSlices(slices, opConfig)
            .then(() => {
                expect(fs.readdirSync('./spec/test_output').length).toEqual(1);
                expect(fs.readFileSync('./spec/test_output/test_undefined', 'utf-8')).toEqual(
                    '42,"test data",55\n'
                    + '43,"more test data",56\n'
                    + '44,"even more test data",57\n'
                    + '42,"test data",55\n'
                    + '43,"more test data",56\n'
                    + '44,"even more test data",57\n\n'
                );
                cleanTestDir();
                done();
            });
    });
    it('creates a single file and adds a header properly', (done) => {
        const opConfig = caseSingleFileAllFieldsHeader;
        const slices = [data, data];
        testHarness.runSlices(slices, opConfig)
            .then(() => {
                expect(fs.readdirSync('./spec/test_output').length).toEqual(1);
                // The empty slice does leave an extra newline at the end of the file, but for some
                // reason this check will fail if that is included in the check
                expect(fs.readFileSync('./spec/test_output/test_undefined', 'utf-8')).toEqual(
                    '"field1","field3","field2"\n'
                    + '42,"test data",55\n'
                    + '43,"more test data",56\n'
                    + '44,"even more test data",57\n'
                    + '42,"test data",55\n'
                    + '43,"more test data",56\n'
                    + '44,"even more test data",57\n\n'
                );
                cleanTestDir();
                done();
            });
    });
    it('creates a single file with a tab delimiter', (done) => {
        const opConfig = caseTabDelimiter;
        const slices = [data];
        testHarness.runSlices(slices, opConfig)
            .then(() => {
                expect(fs.readdirSync('./spec/test_output').length).toEqual(1);
                expect(fs.readFileSync('./spec/test_output/test_undefined', 'utf-8')).toEqual(
                    '42\t"test data"\t55\n'
                    + '43\t"more test data"\t56\n'
                    + '44\t"even more test data"\t57\n\n'
                );
                cleanTestDir();
                done();
            });
    });
    it('creates a single file with a Custom delimiter', (done) => {
        const opConfig = caseCustomDelimiter;
        const slices = [data];
        testHarness.runSlices(slices, opConfig)
            .then(() => {
                expect(fs.readdirSync('./spec/test_output').length).toEqual(1);
                expect(fs.readFileSync('./spec/test_output/test_undefined', 'utf-8')).toEqual(
                    '42^"test data"^55\n'
                    + '43^"more test data"^56\n'
                    + '44^"even more test data"^57\n\n'
                );
                cleanTestDir();
                done();
            });
    });
    it('creates a single file with JSON records on each line', (done) => {
        const opConfig = caseJSON2File;
        const slices = [data];
        testHarness.runSlices(slices, opConfig)
            .then(() => {
                expect(fs.readdirSync('./spec/test_output').length).toEqual(1);
                expect(fs.readFileSync('./spec/test_output/test_undefined', 'utf-8')).toEqual(
                    '{"field1":42,"field3":"test data","field2":55}\n'
                    + '{"field1":43,"field3":"more test data","field2":56}\n'
                    + '{"field1":44,"field3":"even more test data","field2":57}\n'
                );
                cleanTestDir();
                done();
            });
    });
    it('creates a single file with text records on each line', (done) => {
        const opConfig = caseText2File;
        const slices = [data2];
        testHarness.runSlices(slices, opConfig)
            .then(() => {
                expect(fs.readdirSync('./spec/test_output').length).toEqual(1);
                expect(fs.readFileSync('./spec/test_output/test_undefined', 'utf-8')).toEqual(
                    'record1\n'
                    + 'record2\n'
                    + 'record3\n'
                );
                cleanTestDir();
                done();
            });
    });
});
