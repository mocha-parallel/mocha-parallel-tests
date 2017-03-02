#include <nan.h>

using namespace v8;

NAN_METHOD(Length) {
    Nan::Utf8String str(info[0]->ToString());
    int len = strlen(*str);
    info.GetReturnValue().Set(len);
}

NAN_MODULE_INIT(Init) {
    Nan::Set(target, Nan::New("strlen").ToLocalChecked(),
        Nan::GetFunction(Nan::New<FunctionTemplate>(Length)).ToLocalChecked());
}

NODE_MODULE(test_addon, Init)
