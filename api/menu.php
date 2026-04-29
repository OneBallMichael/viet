<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if($_SERVER['REQUEST_METHOD']==='OPTIONS'){http_response_code(200);exit;}

$dataFile = __DIR__ . '/../data/menu.json';

function readMenu($f){
    if(!file_exists($f)) return [];
    $d=json_decode(file_get_contents($f),true);
    return is_array($d)?$d:[];
}
function writeMenu($f,$data){
    file_put_contents($f,json_encode($data,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));
}

$method=$_SERVER['REQUEST_METHOD'];
$menu=readMenu($dataFile);

switch($method){
    case 'GET':
        echo json_encode($menu,JSON_UNESCAPED_UNICODE);
        break;
    case 'POST':
        $input=json_decode(file_get_contents('php://input'),true);
        if(!$input||!isset($input['name'])||!isset($input['category'])){
            http_response_code(400);
            echo json_encode(['error'=>'Wymagane pola: name, category']);
            break;
        }
        $maxId=0;
        foreach($menu as $item) if($item['id']>$maxId) $maxId=$item['id'];
        $newItem=[
            'id'=>$maxId+1,
            'name'=>htmlspecialchars(strip_tags($input['name'])),
            'category'=>htmlspecialchars(strip_tags($input['category'])),
            'price'=>isset($input['price'])?floatval($input['price']):null,
            'prices'=>isset($input['prices'])&&is_array($input['prices'])?$input['prices']:null,
            'tags'=>isset($input['tags'])&&is_array($input['tags'])?array_map('strip_tags',$input['tags']):[]
        ];
        $menu[]=$newItem;
        writeMenu($dataFile,$menu);
        echo json_encode($newItem,JSON_UNESCAPED_UNICODE);
        break;
    case 'PUT':
        $input=json_decode(file_get_contents('php://input'),true);
        if(!$input||!isset($input['id'])){
            http_response_code(400);
            echo json_encode(['error'=>'Wymagane pole: id']);
            break;
        }
        $found=false;
        foreach($menu as &$item){
            if($item['id']===$input['id']){
                if(isset($input['name'])) $item['name']=htmlspecialchars(strip_tags($input['name']));
                if(isset($input['category'])) $item['category']=htmlspecialchars(strip_tags($input['category']));
                if(array_key_exists('price',$input)) $item['price']=$input['price']!==null?floatval($input['price']):null;
                if(array_key_exists('prices',$input)) $item['prices']=$input['prices'];
                if(isset($input['tags'])) $item['tags']=array_map('strip_tags',$input['tags']);
                $found=true;
                break;
            }
        }
        if(!$found){http_response_code(404);echo json_encode(['error'=>'Nie znaleziono']);break;}
        writeMenu($dataFile,$menu);
        echo json_encode(['success'=>true],JSON_UNESCAPED_UNICODE);
        break;
    case 'DELETE':
        $input=json_decode(file_get_contents('php://input'),true);
        if(!$input||!isset($input['id'])){http_response_code(400);echo json_encode(['error'=>'Wymagane pole: id']);break;}
        $menu=array_values(array_filter($menu,function($i)use($input){return $i['id']!==$input['id'];}));
        writeMenu($dataFile,$menu);
        echo json_encode(['success'=>true]);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error'=>'Metoda niedozwolona']);
}
